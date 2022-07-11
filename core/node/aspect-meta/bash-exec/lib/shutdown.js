import { log, colors } from 'dmt/common';

import { exec } from 'child_process';

const bashAction = '/sbin/shutdown -h now';

export default ({ program }) => {
  program.store().save();

  program.sendABC({ message: 'stopping' });

  log.yellow(`Executing bash action: ${colors.green(bashAction)} ...`);

  setTimeout(() => {
    exec(bashAction, (error, stdout, stderr) => {
      if (error) {
        log.write(stdout);
        log.red(stderr);
      }
    });
  }, 500);
};
