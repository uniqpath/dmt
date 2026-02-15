import path from 'path';

import { log, colors, dmtPath } from 'dmt/common';

const scriptsPath = path.join(dmtPath, 'etc/scripts');

import { exec } from 'child_process';

import bashReboot from './reboot.js';

export default ({ program, action }) => {
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
