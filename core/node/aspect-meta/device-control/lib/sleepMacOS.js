import { log, colors } from 'dmt/common';

import { exec } from 'child_process';

const bashAction = '/usr/bin/pmset sleepnow';

export default ({ program }) => {
  return new Promise((success, reject) => {
    log.yellow(`Executing bash action: ${colors.green(bashAction)} ...`);

    setTimeout(() => {
      exec(bashAction, (error, stdout, stderr) => {
        if (error) {
          log.red(stdout);
          log.red(stderr);

          reject(stdout);
        } else {
          success();
        }
      });
    }, 500);
  });
};
