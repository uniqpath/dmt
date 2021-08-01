import os from 'os';

import { push } from 'dmt/notify';

import { log, colors, isRPi, disconnectedIPAddress, globals } from 'dmt/common';

let tickCounter = 0;

export default function checkForLocalOnlyIpAndRebootDevice({ program, ip, prevIp }) {
  if (ip && isRPi()) {
    if (disconnectedIPAddress(ip)) {
      if (prevIp != ip) {
        log.red(`⚠️  Disconneced IP address assigned: ${colors.gray(ip)}`);
        log.cyan('  [ device is "partially connected" - does not have a valid IP address to communicate, perhaps DHCP is not working properly? ]');
      }

      if (os.uptime() > 10 * 60) {
        tickCounter += 1;

        // we reboot if IP was wrong for an entire slowTick period (20s))
        if (tickCounter == globals.slowTickerFactor) {
          const msg = 'Rebooting device in about 10s seconds to try obtain a valid IP address ...';
          log.red(msg);
          push.notify(msg);

          program.showNotification({ msg, ttl: 20, color: '#C90029' });

          setTimeout(() => {
            program.slot('rebootReason').set(`Device had invalid IP address: ${ip}`);
            program.api('device').call('reboot');
          }, 10000);
        }
      }
    } else {
      tickCounter = 0;

      if (prevIp != ip && disconnectedIPAddress(prevIp)) {
        log.green(`✓ Device received a valid IP address (${colors.gray(ip)}) again.`);
      }
    }
  }
}
