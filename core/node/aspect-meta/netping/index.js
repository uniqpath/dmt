import { log, device, apMode, isRPi, isPersonalComputer, isDevMachine, globals } from 'dmt/common';

import os from 'os';

const BOOT_WAIT_SECONDS = 30;

import { desktop } from 'dmt/notify';

import ExecutePing from './executePing.js';

const CLOUDFLARE_DNS = '1.0.0.1';
const DEFAULT_TTL = 20;
const NOTIFICATION_GROUP_PREFIX = `${device().id}_connectivity`;

function reportConnectivityOnLan() {
  return isRPi();
}

function init(program) {
  const wanConnectivity = new ExecutePing({ program, target: CLOUDFLARE_DNS, prefix: 'connectivity' });

  const localConnectivity = new ExecutePing({ program, prefix: 'localConnectivity' });

  wanConnectivity.on('connection_lost', ({ code }) => {
    const color = '#e34042';

    const prefix = isPersonalComputer() ? '❌' : '✖';
    const noConnectivityMsg = `${prefix} Internet unreachable`;

    if (isDevMachine() || !isPersonalComputer()) {
      log.red(noConnectivityMsg);
    }

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: noConnectivityMsg, ttl: DEFAULT_TTL, color, group: `${NOTIFICATION_GROUP_PREFIX}_unreachable` });
    } else {
      desktop.notify(noConnectivityMsg);
    }
  });

  localConnectivity.on('connection_lost', ({ code }) => {
    const color = '#FF7A2C';

    const noConnectivityMsg = '✖ Router unreachable'.trim();

    if (isDevMachine() || !isPersonalComputer()) {
      log.red(noConnectivityMsg);
    }

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: noConnectivityMsg, ttl: 20, color, group: `${NOTIFICATION_GROUP_PREFIX}_local_connectivity` });
    } else {
      desktop.notify(noConnectivityMsg);
    }
  });

  wanConnectivity.on('connection_resumed', () => {
    const prefix = isPersonalComputer() ? '✅' : '✓';
    const connResumedMsg = `${prefix} Internet connection resumed`;

    // NEW❗
    localConnectivity.assumeConnected();

    if (isDevMachine() || !isPersonalComputer()) {
      log.green(connResumedMsg);
    }

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: connResumedMsg, ttl: DEFAULT_TTL, color: '#6BFF74', group: `${NOTIFICATION_GROUP_PREFIX}_resumed` });
    } else {
      desktop.notify(connResumedMsg);
    }

    program.slot('device').removeKeys(['localConnectivityProblem', 'localConnectivityResumed', 'localConnectivityResumedAt']);
  });

  localConnectivity.on('connection_resumed', () => {
    const connResumedMsg = '✓ Router connection resumed';

    if (isDevMachine() || !isPersonalComputer()) {
      log.green(`${connResumedMsg}`);
    }

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: connResumedMsg, ttl: 20, color: '#F1A36B', group: `${NOTIFICATION_GROUP_PREFIX}_local_connectivity` });
    } else {
      desktop.notify(connResumedMsg);
    }
  });

  let wokeAt;
  let lastIntervalAt = Date.now();

  let temp;

  setTimeout(
    () => {
      program.on('tick', () => {
        temp = Date.now();
        setTimeout(() => {
          if (isDevMachine()) {
            log.green(`tick + ${Date.now() - temp}ms`);
          }

          if (!wokeAt || Date.now() - wokeAt > 5000) {
            if (Date.now() - lastIntervalAt <= 2.1 * globals.tickerPeriod) {
              localConnectivity.cleanup();
              wanConnectivity.cleanup();

              if (!apMode()) {
                if (os.uptime() > BOOT_WAIT_SECONDS) {
                  wanConnectivity.ping().then(() => {
                    if (program.slot('device').get('connectivityProblem')) {
                      localConnectivity.ping();
                    }
                  });
                }
              }
            } else {
              if (isDevMachine()) {
                log.magenta(`PC Wake up after ${Math.round((Date.now() - lastIntervalAt) / 1000)}s`);
                log.magenta('Will start pings in 6s');
              }

              localConnectivity.reset();
              wanConnectivity.reset();

              wokeAt = Date.now();
            }
          } else {
            localConnectivity.reset();
            wanConnectivity.reset();
          }

          lastIntervalAt = Date.now();
        }, 500);
      });
    },
    isRPi() ? 7000 : 2000
  );
}

export { init };
