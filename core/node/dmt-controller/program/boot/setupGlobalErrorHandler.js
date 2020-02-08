import { push, desktop } from 'dmt-notify';

import dmt from 'dmt-bridge';
const { log } = dmt;

export default function setupGlobalErrorHandler() {
  process.on('uncaughtException', err => {
    const msg = `Caught global exception: ${err}`;
    log.red(msg);
    log.red(err.stack);
    log.red('EXITING, bye ✋');

    push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg} → PROCESS TERMINATED`, () => {
      process.exit();
    });
  });
}
