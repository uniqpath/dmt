import dmt from 'dmt/common';
const { log } = dmt;

import { push, desktop } from 'dmt/notify';

import stripAnsi from 'strip-ansi';

function terminateProgram(err, reason, program) {
  const msg = `${reason}: ${err}`;

  if (log.isForeground) {
    reportStopping(program);
  }

  log.red(msg);
  log.red(err.stack);
  log.yellow('— PREPARING TO EXIT THE PROGRAM —');

  push
    .highPriority()
    .notify(`🛑😱 ${stripAnsi(msg)} → PROCESS TERMINATED`)
    .then(() => {
      log.yellow('EXITING, bye ✋');
      process.exit();
    });
}

function reportStopping(program) {
  program.sendABC({ message: 'stopping' });
}

export default function setupGlobalErrorHandler(program) {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin, program));

  process.on('SIGTERM', signal => {
    log.yellow(`Process received a ${signal} signal (usually because of normal stop/restart)`);
    reportStopping(program);
    process.exit(0);
  });

  process.on('SIGINT', signal => {
    log.yellow(`Process has been interrupted: ${signal}`);
    reportStopping(program);
    process.exit(0);
  });
}
