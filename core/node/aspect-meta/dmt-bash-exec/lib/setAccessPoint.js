const path = require('path');
const colors = require('colors');

const dmt = require('dmt-bridge');
const { log } = dmt;

const { exec } = require('child_process');

const bashReboot = require('./reboot');

module.exports = ({ program, scriptsPath, action }) => {
  const bashAction = `setup_ap ${action}`;

  exec(path.join(scriptsPath, bashAction), (error, stdout, stderr) => {
    if (error) {
      log.write(stdout);
      log.red(stderr);
    } else {
      log.yellow(`Successfully executed bash action: ${colors.green(bashAction)}`);
      bashReboot({ program });
    }
  });
};
