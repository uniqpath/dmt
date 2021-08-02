import dmt from 'dmt/common';
const { log } = dmt;

import { push, apn } from 'dmt/notify';

import stripAnsi from 'strip-ansi';

let remainingTerminateRetries = 1;

function terminateProgram(err, reason) {
  const exitMsg = 'EXITING ABC, bye ☠️';

  if (remainingTerminateRetries > 0) {
    const msg = `${reason}: ${err}`;
    log.red(msg);
    log.red(err.stack);

    remainingTerminateRetries -= 1;

    const _msg = `🕵️‍♂️🛑😱 ${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)} → ABC PROCESS TERMINATED`;

    push.notify(_msg).then(() => {
      log.yellow(exitMsg);
      process.exit();
    });
  } else {
    log.yellow(
      '⚠️⚠️ Was not able to send a push notification about the original error that cause ABC process crash because of some kind of additional bug inside push notification logic:'
    );

    const msg = `${reason}: ${err}`;
    log.cyan(msg);
    log.cyan(err.stack);

    log.green('We have two problems to solve - fix push notifications first!');

    apn.notify(`ABC 🕵️‍♂️☠️ ${dmt.deviceGeneralIdentifier()}: Bug in pushover notification code, check log`).then(() => {
      log.red(exitMsg);
      process.exit();
    });
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
