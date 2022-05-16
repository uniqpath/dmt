import { log, colors, prettyFileSize } from 'dmt/common';

import wtf from 'wtfnode';

import { push, apn, desktop } from 'dmt/notify';

let terminationInProgress;

import exit from '../exit';
import getExitMsg from '../getExitMsg';

function crashNotify2(exitMsg, delay = 3000) {
  setTimeout(() => {
    setTimeout(() => {
      exit();
    }, delay);

    apn.notify(exitMsg).then(() => {
      exit();
    });
  }, delay);
}

function terminateProgram(err, reason, program) {
  const msg = `${reason}: ${err}`;

  log.red(msg);
  log.red(err.stack);

  if (!terminationInProgress) {
    terminationInProgress = true;

    log.yellow('— PREPARING TO EXIT THE PROGRAM —');

    const exitMsg = getExitMsg(msg);

    crashNotify2(exitMsg, 3000);

    program.exceptionNotify(exitMsg).then(() => {
      exit();
    });
  }
}

function reportStopping(program) {
  program.sendABC({ message: 'stopping' });
}

export default function setupGlobalErrorHandler(program) {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin, program));

  process.on('SIGTERM', signal => {
    reportStopping(program);
    log.yellow(`Process received a ${signal} signal (usually because of normal stop/restart)`);

    process.exit(0);
  });

  process.on('SIGINT', signal => {
    reportStopping(program);
    log.yellow(`Process has been interrupted: ${signal}`);

    if (log.isProfiling()) {
      log.green('Active handles:');
      wtf.dump();
      log.green('Memory usage:');

      for (const [key, size] of Object.entries(process.memoryUsage())) {
        log.write(`${colors.cyan(key)}: ${prettyFileSize(size)}`);
      }
    }

    process.exit(0);
  });
}
