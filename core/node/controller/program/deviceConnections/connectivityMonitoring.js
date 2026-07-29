import { log, executeAt, timeutils, device, isMainServer, isDevUser } from 'dmt/common';
import { push } from 'dmt/notify';

const { formatSeconds, prettyTime, ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY } = timeutils;

const DISCONNECT_TIMEOUT_MS = 20 * ONE_SECOND;
const RESTARTING_TIMEOUT_MS = isDevUser() ? 15 * ONE_MINUTE : 90 * ONE_SECOND;
const STARTUP_GRACE_MS = 40 * ONE_SECOND;
const RESTART_SETTLE_MS = ONE_MINUTE;

const SECOND_PING_WITHIN_MS = 5000;

const PRUNE_INTERVAL = 15 * ONE_DAY;

const IGNORE_DEVICES = [];

const DEBUG = true;

const ttl = 12 * ONE_HOUR;
const startedAt = Date.now();
const disconnectTimers = {};
const deferredDisconnectTimers = {};

let program;
let _slot;

const REPORT_MAIN_DEVICE = false;

const DEVICE_SUFFIX = isMainServer() ? '' : `\n\nSent by ${device().id}`;

function getConnectionState(pubkey) {
  return _slot.get(pubkey);
}

function updateDeviceState(pubkey, data) {
  const current = getConnectionState(pubkey) || {};
  const patch = {};
  patch[pubkey] = { ...current, ...data };
  _slot.update(patch);
}

function clearedRestartFlag(state) {
  if (state.processRestartingAt && Date.now() - state.processRestartingAt > RESTART_SETTLE_MS) {
    if (isDevUser() && DEBUG) {
      log.gray(`Restart settle window elapsed, clearing processRestartingAt: ${state.deviceId}`);
    }

    if (isDevUser() && DEBUG) {
      log.gray(`Connection stable after restart announce, clearing processRestartingAt: ${state.deviceId}`);
    }

    return { processRestartingAt: undefined };
  }
  return {};
}

function networkSuffix(network) {
  return network ? `\n\nNetwork: ${network}` : '';
}

function getDeviceIcon(state) {
  return state.mainDevice ? '💻' : '';
}

function reportDisconnected(pubkey) {
  const state = getConnectionState(pubkey);
  const { deviceId, connectedAt, network, mainDevice } = state;

  if (IGNORE_DEVICES.includes(deviceId)) return;

  const now = Date.now();
  const onlineDuration = connectedAt ? ` after ${formatSeconds((now - connectedAt) / 1000)}` : '';

  const id = deviceId || pubkey;

  const msg = `Disconnected${onlineDuration}`;

  if (!mainDevice || (mainDevice && REPORT_MAIN_DEVICE)) {
    log.red(`${getDeviceIcon(state)}❌ ${id} ${msg}`);

    push
      .title(`${getDeviceIcon(state)}❌ ${id} OFFLINE`)
      .ttl(ttl)
      .notify(`${msg}${networkSuffix(network)}${DEVICE_SUFFIX}`);
  }

  updateDeviceState(pubkey, { disconnectReportedAt: Date.now() });
}

function scheduleDisconnectCheck(pubkey) {
  clearTimeout(disconnectTimers[pubkey]);

  disconnectTimers[pubkey] = setTimeout(() => {
    const state = getConnectionState(pubkey);

    if (state?.connected) {
      updateDeviceState(pubkey, { connected: false });

      const restartingMsAgo = state.processRestartingAt ? Date.now() - state.processRestartingAt : Infinity;
      const remainingMs = RESTARTING_TIMEOUT_MS - restartingMsAgo;

      if (remainingMs > 0) {
        clearTimeout(deferredDisconnectTimers[pubkey]);

        deferredDisconnectTimers[pubkey] = setTimeout(() => {
          if (!getConnectionState(pubkey)?.connected) {
            reportDisconnected(pubkey);
          }
          delete deferredDisconnectTimers[pubkey];
        }, remainingMs);
      } else {
        reportDisconnected(pubkey);
      }
    }

    delete disconnectTimers[pubkey];
  }, getConnectionState(pubkey).disconnectTimeoutMs || DISCONNECT_TIMEOUT_MS);
}

export function init(_program) {
  program = _program;
  _slot = _program.slot('connectionMonitoring');

  setTimeout(() => {
    const connections = _slot.get() || {};

    for (const [pubkey, slot] of Object.entries(connections)) {
      if (slot?.connected && slot.lastPingAt < startedAt) {
        updateDeviceState(pubkey, { connected: false });

        const restartingMsAgo = slot.processRestartingAt ? Date.now() - slot.processRestartingAt : Infinity;
        const remainingMs = RESTARTING_TIMEOUT_MS - restartingMsAgo;

        if (remainingMs > 0) {
          clearTimeout(deferredDisconnectTimers[pubkey]);
          deferredDisconnectTimers[pubkey] = setTimeout(() => {
            if (!getConnectionState(pubkey)?.connected) {
              reportDisconnected(pubkey, getConnectionState(pubkey)?.deviceId || pubkey);
            }
            delete deferredDisconnectTimers[pubkey];
          }, remainingMs);
        } else {
          reportDisconnected(pubkey, slot.deviceId || pubkey);
        }
      } else if (!slot?.connected && !slot?.disconnectReportedAt && slot?.processRestartingAt) {
        const restartingMsAgo = Date.now() - slot.processRestartingAt;
        const remainingMs = RESTARTING_TIMEOUT_MS - restartingMsAgo;

        if (remainingMs > 0) {
          clearTimeout(deferredDisconnectTimers[pubkey]);
          deferredDisconnectTimers[pubkey] = setTimeout(() => {
            if (!getConnectionState(pubkey)?.connected) {
              reportDisconnected(pubkey, getConnectionState(pubkey)?.deviceId || pubkey);
            }
            delete deferredDisconnectTimers[pubkey];
          }, remainingMs);
        } else if (!getConnectionState(pubkey)?.connected) {
          reportDisconnected(pubkey, slot.deviceId || pubkey);
        }
      }
    }
  }, STARTUP_GRACE_MS);

  executeAt('00:00', () => {
    const connections = _slot.get();
    const now = Date.now();

    for (const [pubkey, slot] of Object.entries(connections)) {
      if (slot.lastPingAt && now - slot.lastPingAt > PRUNE_INTERVAL) {
        const deviceId = slot?.deviceId;
        const msg = `Stopped monitoring online status because not seen for ${prettyTime(slot.lastPingAt)}${DEVICE_SUFFIX}`;
        push
          .title(`🛑 ${deviceId || pubkey}`)
          .ttl(ttl)
          .notify(msg);
        log.gray(msg);
        _slot.removeKey(pubkey);
      }
    }
  });

  if (program.slot('device').get('serverMode')) {
    executeAt(['8:00', '10:00', '12:00', '15:00', '17:00', '20:00', '22:00'], () => {
      const connections = _slot?.get() || {};

      const offlineDevices = Object.values(connections).filter(state => state.deviceId && !state.connected && !state.mainDevice);

      if (offlineDevices.length === 0) return;

      const lines = offlineDevices.map(state => {
        const offlineSince = state.lastPingAt ? `${formatSeconds((Date.now() - state.lastPingAt) / 1000)}` : 'never connected';
        return `${getDeviceIcon(state)}❌ ${state.deviceId} (${offlineSince})`;
      });

      const msg = `${lines.join('\n')}${DEVICE_SUFFIX}`;
      log.yellow(`Daily offline report:\n${msg}`);
      push
        .title('⚠️ Offline devices')
        .ttl(3 * ONE_HOUR)
        .notify(msg);
    });
  }
}

export function receivedHello({ pubkey, deviceId, dmtVersion, osUptime, network, mainDevice, secondPingWithinMs, disconnectTimeoutMs }) {
  const osBootedAt = Date.now() - 1000 * osUptime;
  updateDeviceState(pubkey, { deviceId, osBootedAt, dmtVersion, network, mainDevice, secondPingWithinMs, disconnectTimeoutMs });
}

export function receivedPing(
  pubkey,
  {
    deviceId = undefined,
    osUptime = undefined,
    network = undefined,
    mainDevice = undefined,
    secondPingWithinMs = undefined,
    disconnectTimeoutMs = undefined
  } = {}
) {
  const state = getConnectionState(pubkey);

  if (!state.mainDevice && !state.connected && isDevUser() && DEBUG) {
    log.green(`${deviceId || state.deviceId} PID ${state.clientPID} received (first) ping`);
  }

  if (deviceId && osUptime) {
    receivedHello({ pubkey, mainDevice, deviceId, osUptime, secondPingWithinMs, disconnectTimeoutMs });
  }

  if (!state.deviceId || IGNORE_DEVICES.includes(state.deviceId)) return;

  clearTimeout(disconnectTimers[pubkey]);
  clearTimeout(deferredDisconnectTimers[pubkey]);
  delete deferredDisconnectTimers[pubkey];

  const now = Date.now();

  const { lastPingAt } = state;

  if (state.processRestartingAt && isDevUser() && DEBUG) {
    log.gray(`Received first ping from ${state.deviceId} PID ${state.clientPID} after restart announce ... `);
  }

  updateDeviceState(pubkey, { lastPingAt: now, network });

  if (lastPingAt && Date.now() - lastPingAt > (state?.secondPingWithinMs || SECOND_PING_WITHIN_MS)) return;

  deviceId = state.deviceId;
  const { connected, osBootedAt } = state;

  if (!connected) {
    let osUptimeMsg = '';
    if (osBootedAt) {
      const uptime = (Date.now() - osBootedAt) / 1000;
      osUptimeMsg = `\n\nDevice uptime: ${formatSeconds(uptime)}`;
    }
    if (connected === undefined) {
      const msg = `Registered for connection monitoring${DEVICE_SUFFIX}`;
      log.magenta(msg);
      push
        .title(`🆕 ${deviceId}`)
        .ttl(ttl)
        .notify(msg);
    } else if (state.disconnectReportedAt) {
      const offlineDuration = state.disconnectReportedAt ? ` after ${formatSeconds((now - state.disconnectReportedAt) / 1000)}` : '';
      const msg = `Connected${offlineDuration}${osUptimeMsg}`;

      if (!state.mainDevice || (state.mainDevice && REPORT_MAIN_DEVICE)) {
        log.green(`${getDeviceIcon(state)}✅ ${deviceId} ${msg}`);

        push
          .title(`${getDeviceIcon(state)}✅ ${deviceId} ONLINE`)
          .ttl(ttl)
          .notify(`${msg}${networkSuffix(state.network)}${DEVICE_SUFFIX}`);
      }
    }
    updateDeviceState(pubkey, {
      lastPingAt: now,
      connected: true,
      connectedAt: Date.now(),
      disconnectReportedAt: undefined,
      ...clearedRestartFlag(state)
    });
  } else {
    updateDeviceState(pubkey, { lastPingAt: now, ...clearedRestartFlag(state) });
  }

  scheduleDisconnectCheck(pubkey);
}

const restartAnnounces = {};

export function processRestarting(pubkey) {
  restartAnnounces[pubkey] = (restartAnnounces[pubkey] || 0) + 1;
  const state = getConnectionState(pubkey);
  if (!state.mainDevice) {
    log.yellow(`Process restart announce #${restartAnnounces[pubkey]}: ${getConnectionState(pubkey)?.deviceId || pubkey}`);
  }
  updateDeviceState(pubkey, { processRestartingAt: Date.now() });
}
