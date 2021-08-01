import colors from 'colors';
import dmt from 'dmt/common';
import os from 'os';

import { push } from 'dmt/notify';

const { log } = dmt;

let tickCounter = 0;

export default function checkForLocalOnlyIpAndRebootDevice({ program, ip, prevIp }) {
  if (ip && dmt.isRPi()) {
    if (dmt.disconnectedIPAddress(ip)) {
      if (prevIp != ip) {
        log.red(`⚠️  Disconneced IP address assigned: ${colors.gray(ip)}`);
        log.cyan('  [ device is "partially connected" - does not have a valid IP address to communicate, perhaps DHCP is not working properly? ]');
      }

      if (os.uptime() > 10 * 60) {
        tickCounter += 1;

        // we reboot if IP was wrong for an entire slowTick period (20s))
        if (tickCounter > dmt.globals.slowTickerFactor) {
          const msg = 'Rebooting device in a few seconds to try obtain a valid IP address ...';
          log.red(msg);
          push.notify(msg);

          program.showNotification({ msg, ttl: 20, bgColor: '#C90029', color: 'white' });

          tickCounter = 0;

          setTimeout(() => {
            program.store('rebootReason').set(`Device had invalid IP address: ${ip}`);
            program.emit('dmt_gui_action', { action: 'reboot', namespace: 'device' });
          }, 4000);
        }
      }
    } else if (dmt.disconnectedIPAddress(prevIp)) {
      if (prevIp != ip) {
        log.green(`✓ Device received a valid IP address (${colors.gray(ip)}) again.`);
      }

      tickCounter = 0;
    }
  }
}
