import { spawn } from 'child_process';

import dmt from 'dmt/common';
const { log } = dmt;

export default function startDMT(notify) {
  return new Promise((success, reject) => {
    const child = spawn(process.execPath, dmt.nodeFlags.concat([dmt.dmtProcManagerPath, 'start', 'dmt-proc.js']), {
      cwd: dmt.daemonsPath,
      detached: true,
      shell: true,
      stdio: 'ignore'
    });

    child.on('error', err => {
      const msg = 'Error starting DMT process';
      log.red(msg);
      notify(msg);
      log.red(err);
    });
  });
}
