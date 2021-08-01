import os from 'os';

import dmt from 'dmt/common';
import { networkInterfaces } from 'dmt/net';

import { push } from 'dmt/notify';

const { log } = dmt;

import checkForLocalOnlyIpAndRebootDevice from './checkForLocalOnlyIpAndRebootDevice';

const BOOT_LIMIT_SECONDS = 60;
const NETWORK_WAIT_SECONDS = 3 * BOOT_LIMIT_SECONDS;

let needToSendPushMsg = os.uptime() < BOOT_LIMIT_SECONDS;

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export default function determineIP(program) {
  if (program.apMode()) {
    const ip = dmt.accessPointIP;
    if (program.store('device').get().ip != ip) {
      program.store('device').update({ ip });
    }
  } else {
    networkInterfaces()
      .then(interfaces => {
        let ip;

        if (interfaces && interfaces.length >= 1) {
          ip = interfaces[0].ip_address;
        }

        if (ip && needToSendPushMsg && os.uptime() < NETWORK_WAIT_SECONDS) {
          const reason = program.store('rebootReason').get();

          const msg = `📟 BOOTED${isEmpty(reason) ? '' : ` (${reason})`}`;
          push.notify(msg);
          log.cyan(msg);

          if (isEmpty(reason)) {
            program.showNotification({ msg, ttl: 90, bgColor: '#009D65', color: 'white' });
          } else {
            program.store('rebootReason').remove({ announce: false });
            program.showNotification({ msg, ttl: 120, bgColor: '#A3229B', color: 'white' });
          }

          needToSendPushMsg = false;
        }

        const prevIp = program.store('device').get().ip;

        checkForLocalOnlyIpAndRebootDevice({ program, ip, prevIp });

        if (prevIp != ip) {
          program.store('device').update({ ip });

          if (!ip) {
            log.yellow('⚠️  Device currently does not have any IP address assigned');
          }
        }
      })
      .catch(e => {
        log.red(e);
      });
  }
}
