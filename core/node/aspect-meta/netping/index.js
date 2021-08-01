import { log, isMainDevice, isDevUser, device, apMode, isRPi } from 'dmt/common';

import { desktop } from 'dmt/notify';

import ExecutePing from './executePing';

const CLOUDFLARE_DNS = '1.0.0.1';
const DEFAULT_TTL = 20;
const NOTIFICATION_GROUP_PREFIX = `${device().id}_connectivity`;

let connectionLostCount = 0;

function reportConnectivityOnLan() {
  return isRPi();
}

function init(program) {
  if (!['dnevna', 'balkon'].includes(device().id)) {
    return;
  }

  const executePing = new ExecutePing({ program, target: CLOUDFLARE_DNS, prefix: 'connectivity' });

  const localConnectivity = new ExecutePing({ program, prefix: 'localConnectivity' });

  executePing.on('connection_lost', ({ code }) => {
    connectionLostCount += 1;

    const color = '#e34042';

    const noConnectivityMsg = '✖ Internet unreachable';

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: noConnectivityMsg, ttl: DEFAULT_TTL, color, group: `${NOTIFICATION_GROUP_PREFIX}_unreachable` });
    } else {
      desktop.notify(noConnectivityMsg);
    }
  });

  executePing.on('connection_resumed', () => {
    const connResumedMsg = 'Internet connection resumed';

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: connResumedMsg, ttl: DEFAULT_TTL, color: '#E9D872', group: `${NOTIFICATION_GROUP_PREFIX}_resumed` });
    } else {
      desktop.notify(connResumedMsg);
    }

    program.store('device').removeKeys(['localConnectivityProblem', 'localConnectivityResumed', 'localConnectivityResumedAt']);
  });

  localConnectivity.on('connection_lost', ({ code }) => {
    const color = '#FF7A2C';

    const noConnectivityMsg = '✖ Router unreachable';

    if (reportConnectivityOnLan()) {
      log.red(`${noConnectivityMsg} — ping fail ${code || ''}`.trim());
      program.nearbyNotification({ msg: noConnectivityMsg, ttl: 20, color, group: `${NOTIFICATION_GROUP_PREFIX}_local_connectivity` });
    } else {
      desktop.notify(noConnectivityMsg);
    }
  });

  localConnectivity.on('connection_resumed', () => {
    const connResumedMsg = 'Router connection resumed';

    if (reportConnectivityOnLan()) {
      program.nearbyNotification({ msg: connResumedMsg, ttl: 20, color: '#F1A36B', group: `${NOTIFICATION_GROUP_PREFIX}_local_connectivity` });
    } else {
      desktop.notify(connResumedMsg);
    }
  });

  const interval = 'tick';

  let count = 0;

  program.on(interval, () => {
    if (!apMode()) {
      if (count > 0) {
        executePing.ping().then(() => {
          if (program.store('device').get('connectivityProblem')) {
            localConnectivity.ping();
          }
        });
      } else {
        count += 1;
      }
    }
  });
}

export { init };