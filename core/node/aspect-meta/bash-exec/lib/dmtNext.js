import path from 'path';

import { log, colors } from 'dmt/common';

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
