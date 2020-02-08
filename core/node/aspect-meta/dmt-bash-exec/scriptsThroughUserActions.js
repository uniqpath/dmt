const path = require('path');
const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const bashShutdown = require('./lib/shutdown');
const bashReboot = require('./lib/reboot');
const bashSetAccessPoint = require('./lib/setAccessPoint');
const bashDmtNext = require('./lib/dmtNext');

const scriptsPath = path.join(dmt.dmtPath, 'etc/scripts');

function scriptActionHandler({ program, action, storeName }) {
  if (storeName == 'controller') {
    log.yellow(`Received ${colors.magenta(storeName)}:${colors.cyan(action)} action`);

    switch (action) {
      case 'dmt_next':
        bashDmtNext({ scriptsPath });
        return;
      default:
        break;
    }

    if (!dmt.isRPi()) {
      log.red(
        `Device is not ${colors.yellow(
          'RaspberryPi'
        )}, ignoring this action! It shouldn't have come in the first place because options in GUI should not be visible!`
      );
      return;
    }

    switch (action) {
      case 'shutdown':
        bashShutdown({ program });
        break;
      case 'reboot':
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

module.exports = {
  scriptActionHandler
};