import dmt from 'dmt/bridge';
const { log } = dmt;

import { push, desktop } from 'dmt/notify';

import stripAnsi from 'strip-ansi';

function terminateProgram(err, reason) {
  const msg = `${reason}: ${err}`;
  log.red(msg);
  log.red(err.stack);
  log.red('EXITING, bye ✋');

  push.notify(`${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)} → PROCESS TERMINATED`).then(() => {
    process.exit();
  });
}

export default function setupGlobalErrorHandler() {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin));
}
