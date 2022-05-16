import { log } from 'dmt/common';

import { push, apn } from 'dmt/notify';

import stripAnsi from 'strip-ansi';

let terminationInProgress;

function exit() {
  log.yellow('EXITING ABC, bye ☠️');
  process.exit();
}

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

function terminateProgram(err, reason) {
  const msg = `${reason}: ${err}`;

  log.red(msg);
  log.red(err.stack);

  if (!terminationInProgress) {
    terminationInProgress = true;

    log.yellow('— PREPARING TO EXIT ABC —');

    const exitMsg = `🪲😱 ${stripAnsi(msg)} → 🛑 ABC PROCESS TERMINATED`;

    crashNotify2(exitMsg, 3000);

    try {
      push
        .highPriority()
        .notify(exitMsg)
        .then(() => {
          exit();
        });
    } catch (e) {
      log.red('⚠️ Error in push message implementation:');
      log.red(e);

      crashNotify2(exitMsg, 2000);
    }
  }
}

export default function setupGlobalErrorHandler() {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin));

  process.on('SIGTERM', signal => {
    log.yellow(`ABC Process received a ${signal} signal`);
    process.exit(0);
  });

  process.on('SIGINT', signal => {
    log.yellow(`ABC Process has been interrupted: ${signal}`);
    process.exit(0);
  });
}
