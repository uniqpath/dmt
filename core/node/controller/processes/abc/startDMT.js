import { spawn } from 'child_process';

import { push } from 'dmt/notify';

import { log, nodeFlags, dmtProcManagerPath, daemonsPath } from 'dmt/common';

export default function startDMT() {
  return new Promise((success, reject) => {
    const child = spawn(process.execPath, nodeFlags.concat([dmtProcManagerPath, 'start', 'dmt-proc.js']), {
      cwd: daemonsPath,
      detached: true,
      stdio: 'ignore'
    });

    child.on('error', err => {
      const msg = 'Error starting DMT process';
      log.red(msg);
      push.notify(msg);
      log.red(err);
    });
  });
}
