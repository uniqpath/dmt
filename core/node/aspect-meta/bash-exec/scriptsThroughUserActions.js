import path from 'path';

import { log, colors, dmtPath, isRPi } from 'dmt/common';

import bashShutdown from './lib/shutdown';
import bashReboot from './lib/reboot';
import bashSetAccessPoint from './lib/setAccessPoint';
import bashDmtNext from './lib/dmtNext';
import sleepMacOS from './lib/sleepMacOS';

const scriptsPath = path.join(dmtPath, 'etc/scripts');

function scriptActionHandler({ program, action, namespace }) {
  if (namespace == 'device') {
    log.yellow(`Received ${colors.magenta(namespace)}:${colors.cyan(action)} action`);

    switch (action) {
      case 'dmt_next':
        bashDmtNext({ scriptsPath });
        return;
      case 'sleep_macos':
        log.red('Sleeping ...');
        sleepMacOS({ program });
        return;
      default:
        break;
    }

    if (!isRPi()) {
      log.red(
        `Device is not ${colors.yellow(
          'RaspberryPi'
        )}, ignoring this action! It shouldn't have come in the first place because options in GUI should not be visible!`
      );
      return;
    }

    switch (action) {
      case 'shutdown':
        log.red('Shutting down now...');
        bashShutdown({ program });
        break;
      case 'reboot':
        log.red('Rebooting now...');
        bashReboot({ program });
        break;
      case 'ap_mode_enable':
        bashSetAccessPoint({ program, scriptsPath, action: 'enable' });
        break;
      case 'ap_mode_disable':
        bashSetAccessPoint({ program, scriptsPath, action: 'disable' });
        break;
      default:
        break;
    }
  }
}

export { scriptActionHandler };
