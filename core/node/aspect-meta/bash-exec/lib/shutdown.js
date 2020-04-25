import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

import { exec } from 'child_process';

const bashAction = '/sbin/shutdown -h now';

export default ({ program }) => {
  program.store.persistState();

  log.yellow(`Executing bash action: ${colors.green(bashAction)} ...`);

  exec(bashAction, (error, stdout, stderr) => {
    if (error) {
      log.write(stdout);
      log.red(stderr);
    }
  });
};
