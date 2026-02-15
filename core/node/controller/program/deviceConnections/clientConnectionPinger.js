import os from 'os';

import tcpPing from './tcpPing.js';

const DEBUG = false;

function isDebug() {
  return DEBUG && isMainDevice() && isDevUser();
}

import { isMacLidUp } from 'dmt/device-control';
import { log, device, dmtVersion, isDevUser, isLanServer, isMainDevice, isMacOS } from 'dmt/common';
import LocalConnectionMonitoring from './localConnectionMonitoring.js';

import { getMainServerEndpoint } from './serverEndpoint.js';

const ADDITIONAL_MONITORINGS = { theta: 'wss://zetaseek.com/ws' };

const TROUBLED_CONNECTIONS = 'zatoglav/music';

function shouldMonitorConnection(program) {
  return isDevUser() && (isMainDevice() || program.isHub() || device().id == 'zeta' || isLanServer());
}

const PING_INTERVAL = 3000;

let processIsStopping;

function reportInterrupt(connector, signal) {
  clearTimeout(connector.__pingTimeoutHandler);
  processIsStopping = true;

  if (connector.isReady()) {
    if (isDebug()) {
      log.red('SENDING INTERRUPT NOTICE');
    }

    connector
      .remoteObject('monitoring')
      .call(signal)
      .then(() => {
        if (isDebug()) {
          log.green('Interrupt signal successful');
        }
      })
      .catch(e => {});
  }
}

function connectForMonitoring({ program, connectorPool, endpoint }) {
  const localConnectionMonitoring = new LocalConnectionMonitoring(program, { active: false });
  connectorPool.getConnector({ endpoint }).then(connector => {
    program.on('SIGTERM', () => {
      reportInterrupt(connector, 'sigterm');
    });

    program.on('SIGINT', () => {
      reportInterrupt(connector, 'sigint');
    });

    const deviceId = device().id;
    const osUptime = os.uptime();

    let helloSent;
    let firstPing = true;

    let secondPingWithinMs;
    let disconnectTimeoutMs;

    if (TROUBLED_CONNECTIONS.includes(device().id)) {
      secondPingWithinMs = 700000;
      disconnectTimeoutMs = 1800000;
    }

    const monitorClientSidePing = () => {
      connector.__clientSideDisconnectMonitoring = setTimeout(monitorClientSidePing, 1000);
      localConnectionMonitoring.monitorClientSidePing();
    };

    monitorClientSidePing();

    const sendPing = () => {
      if (!processIsStopping) {
        if (connector.isReady()) {
          if (isDebug() && firstPing) {
            log.green('Sending first connection monitoring ping ...');
          }
          const data = { network: program.network.name() };
          if (!helloSent) {
            data.deviceId = deviceId;
            data.osUptime = osUptime;
            data.clientPID = process.pid;
            data.dmtVersion = dmtVersion();
            data.mainDevice = isMainDevice();
            data.secondPingWithinMs = secondPingWithinMs;
            data.disconnectTimeoutMs = disconnectTimeoutMs;
          }

          if (!isMacOS() || (isMacOS() && isMacLidUp())) {
            if (isDebug()) {
              log.gray('ping');
            }

            connector
              .remoteObject('monitoring')
              .call('ping', data)
              .then(() => {
                if (firstPing) {
                  if (isDebug() && firstPing) {
                    log.gray(`✓ Successfully pinged ${connector.remoteAddress()}.`);
                  }
                  firstPing = false;
                }

                helloSent = true;

                if (isDebug()) {
                  log.cyan('successful ping');
                }

                localConnectionMonitoring.successfullPing();
              })
              .catch(e => {});
          }
        } else if (isDebug()) {
          log.red('Connector not ready');
        }

        connector.__pingTimeoutHandler = setTimeout(sendPing, PING_INTERVAL);
      }
    };

    program.on('ready', () => {
      sendPing();
    });

    connector.on('ready', () => {
      if (!helloSent) {
        connector
          .remoteObject('monitoring')
          .call('hello', {
            deviceId,
            osUptime,
            dmtVersion: dmtVersion(),
            network: program.network.name(),
            mainDevice: isMainDevice(),
            secondPingWithinMs,
            disconnectTimeoutMs
          })
          .then(() => {
            helloSent = true;
          })
          .catch(() => {});
      }
    });
  });
}

export default function init({ program, connectorPool }) {
  const CLOUDFLARE_DNS = '1.0.0.1';

  if (shouldMonitorConnection(program)) {
    const endpoint = getMainServerEndpoint();
    if (endpoint) {
      connectForMonitoring({ program, connectorPool, endpoint });
    }
  }

  for (const [deviceId, endpoint] of Object.entries(ADDITIONAL_MONITORINGS)) {
    if (device().id == deviceId) {
      connectForMonitoring({ program, endpoint, connectorPool });
    }
  }
}
