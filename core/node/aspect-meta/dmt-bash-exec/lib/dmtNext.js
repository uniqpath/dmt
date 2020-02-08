import path from 'path';
import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;

import { exec } from 'child_process';

export default ({ scriptsPath }) => {
  const bashAction = 'dmt_next';

  exec(path.join(scriptsPath, bashAction), (error, stdout, stderr) => {
    if (error) {
      log.write(stdout);
      log.red(stderr);
    } else {
      log.yellow(`Successfully executed bash action: ${colors.green(bashAction)}`);
    }
  });
};
