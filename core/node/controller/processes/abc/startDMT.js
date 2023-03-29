import { spawn } from 'child_process';

import { push } from 'dmt/notify';

import { log, nodeFlags, dmtProcManagerPath, daemonsPath } from 'dmt/common';

const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

export default function startDMT(counter = 0) {
  if (counter > MAX_RETRIES) {
    const msg = `⚠️  Failed to spawn dmt-proc after ${MAX_RETRIES} retries`;
    log.red(msg);
    push.highPriority().notify(msg);
    return;
  }

  const child = spawn(process.execPath, nodeFlags.concat([dmtProcManagerPath, 'start', 'dmt-proc.js', '--from_abc']), {
    cwd: daemonsPath,
    detached: true,
    stdio: 'ignore'
  });

  child.on('error', err => {
    const msg = `⚠️  Error starting DMT process, retry #${counter + 1}`;
    log.yellow(msg);
    log.red(err);

    setTimeout(() => {
      startDMT(counter + 1);
    }, RETRY_DELAY);

    push.highPriority().notify(msg);
  });
}
