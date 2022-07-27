import { log, isMainDevice, device } from 'dmt/common';
import { push, apn } from 'dmt/notify';

const slotName = 'blinds';

const PRESENCE_INTERVAL = 5;

const REPORT_PRESENCE = true;

function deviceHandlesBlinds(program) {
  if (program.isHub() || ['tv-ap2', 'turbine', 'andreja'].includes(device().id)) {
    return true;
  }
}

function updateBlindsState(id, _patch, { announce = true, program }) {
  const currentState = program.store(slotName).get(id) || {};

  const patch = {};
  patch[id] = { ...currentState, ..._patch };
  program.store(slotName).update(patch, { announce });
}

function detectStaleModules(program) {
  const state = program.store(slotName).get();

  let changed;

  for (const [id, data] of Object.entries(state)) {
    if (data.present) {
      if (data.lastSeenAt && Date.now() - data.lastSeenAt >= 2.5 * PRESENCE_INTERVAL * 1000) {
        updateBlindsState(id, { present: false, detectedMissing: true }, { program, announce: false });

        if (program.isHub()) {
          const msg = `${id} module missing`;

          if (REPORT_PRESENCE) {
          }

          log.red(msg);
        }

        changed = true;
      } else if (data.detectedMissing) {
        updateBlindsState(id, { detectedMissing: false }, { program, announce: false });

        if (program.isHub()) {
          const msg = `${id} module present again`;

          if (REPORT_PRESENCE) {
          }

          log.green(msg);
        }
      }
    }

    if (data.blindsStatus == 'moving' && data.lastMovingAt && Date.now() - data.lastMovingAt > 5 * 1000) {
      delete data.blindsStatus;
      program.store(slotName).update(data, { announce: false });
      changed = true;
    }
  }

  if (changed) {
    program.store().announceStateChange();
  }
}

function onProgramTick(program) {
  if (deviceHandlesBlinds(program)) {
    detectStaleModules(program);
  }
}

function setup(program) {}

function handleBooted(program, { placeId, blindsId, blindsDirection, moduleIp }) {
  const tag = `${placeId}-${blindsId}-${blindsDirection} (${moduleIp})`;
  const msg = `Module ${tag} BOOTED`;
  apn.notify(msg);

  program.nearbyNotification({ msg, ttl: 30, omitDeviceName: true });
}

function handleMoving(program, { placeId, blindsId, blindsDirection, blindsStatus }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;

  updateBlindsState(id, { blindsStatus, lastMovingAt: Date.now() }, { program });
}

function handlePong(program, { placeId, blindsId, blindsDirection, blindsStatus }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;
  program.showNotification({ msg: `PONG from blinds ${id}` });
}

function handlePresence(program, { placeId, blindsId, blindsDirection }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;

  const alreadyPresent = program.store(slotName)?.present;

  updateBlindsState(id, { lastSeenAt: Date.now(), present: true }, { announce: !alreadyPresent, program });
}

function handleStopped(program, { placeId, blindsId, blindsDirection, blindsStatus }) {
  const id = `${placeId}-${blindsId}-${blindsDirection}`;

  updateBlindsState(id, { blindsStatus: 'stopped' }, { program });
}

function handleMqttEvent({ program, topic, msg }) {
  if (!deviceHandlesBlinds(program)) {
    return;
  }

  let data;

  if (topic == 'blinds') {
    try {
      data = JSON.parse(msg);

      const { placeId, blindsId, blindsAction, blindsDirection, blindsStatus } = data;
      const id = `${placeId}-${blindsId}-${blindsDirection}`;

      if (isMainDevice() && blindsStatus != 'presence') {
        log.cyan(msg);
      }

      if (blindsAction == 'move') {
        if (program.isHub()) {
          if (program.store(slotName).get(id)?.blindsStatus == 'moving') {
            program.nearbyNotification({ msg: `${id} received stop command`, ttl: 5, color: '#5DD5B4', omitDeviceName: true, group: `blinds_${id}_stop` });
            program.nearbyNotification({ group: `blinds_${id}_moving` });
          } else {
            program.nearbyNotification({ msg: `${id} received move command`, ttl: 5, color: '#279276', omitDeviceName: true, group: `blinds_${id}_move` });
          }
        }
      } else {
        switch (blindsStatus) {
          case 'booted':
            if (program.isHub()) {
              handleBooted(program, data);
            }
            break;

          case 'moving':
            handleMoving(program, data);
            break;
          case 'presence':
            handlePresence(program, data);
            break;
          case 'stopped':
            if (program.isHub()) {
              program.nearbyNotification({
                group: `blinds_${id}_moving`
              });
            }
            handleStopped(program, data);
            break;
          case 'pong':
            if (isMainDevice()) {
              handlePong(program, data);
            }
            break;
          default:
            break;
        }
      }
    } catch (e) {
      log.yellow('⚠️ Error parsing blinds json message:');
      log.red(msg);
      log.red(e);
      program.exceptionNotify(e.message);
    }
  }
}

export { setup, handleMqttEvent, onProgramTick };
