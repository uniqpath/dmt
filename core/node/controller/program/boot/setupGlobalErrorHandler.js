import dmt from 'dmt/common';
const { log } = dmt;

import { push, desktop } from 'dmt/notify';

import stripAnsi from 'strip-ansi';

function terminateProgram(err, reason) {
  const msg = `${reason}: ${err}`;
  log.red(msg);
  log.red(err.stack);
  log.red('EXITING, bye ✋');

  push.notify(`🛑😱 ${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)} → PROCESS TERMINATED`).then(() => {
    process.exit();
  });
}

export default function setupGlobalErrorHandler() {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin));

  process.on('beforeExit', code => {
    log.red(`Process will exit with code: ${code}`);
    setTimeout(() => {
      process.exit(code);
    }, 100);
  });

  process.on('SIGTERM', signal => {
    log.yellow(`Process received a ${signal} signal (usually because of normal stop/restart)`);
    process.exit(0);
  });

  process.on('SIGINT', signal => {
    log.yellow(`Process has been interrupted: ${signal}`);
    process.exit(0);
  });
}
