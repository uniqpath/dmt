import os from 'os';
import colors from 'colors';

import dmt from 'dmt/common';
import { networkInterfaces } from 'dmt/net';

import { push } from 'dmt/notify';

const { log } = dmt;

const BOOT_LIMIT_SECONDS = 40;
const NETWORK_WAIT_SECONDS = 3 * 60;

let needToSendPushMsg = os.uptime() < BOOT_LIMIT_SECONDS;

function automaticPrivateIP(ip) {
  return ip.startsWith('169.254');
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
          push.notify(`📟 BOOTED`);
          needToSendPushMsg = false;
        }

        if (program.store('device').get().ip != ip) {
          program.store('device').update({ ip });

          if (!ip) {
            log.yellow('⚠️  Device currently does not have any IP address assigned');
          }

          if (automaticPrivateIP(ip)) {
            log.yellow(`⚠️  Automatic Private IP address assigned: ${colors.gray(ip)}`);
            log.gray('this means that device temporarily cannot see the network or that dhcp server is not present on the network');
          } else if (ip && automaticPrivateIP(program.store('device').get().ip)) {
            log.green(`✓ Device received a valid IP address (${colors.gray(ip)}) again.`);
          }
        }
      })
      .catch(e => {});
  }
}
