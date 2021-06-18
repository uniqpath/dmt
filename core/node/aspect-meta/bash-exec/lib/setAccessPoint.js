import path from 'path';
import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

import { exec } from 'child_process';

import bashReboot from './reboot';

export default ({ program, scriptsPath, action }) => {
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
