import * as dmt from 'dmt/common';
const { log, isMainDevice } = dmt;

import stripAnsi from 'strip-ansi';

import { push, apn, desktop } from 'dmt/notify';

import exit from './exit.js';

const DEFAULT_DELAY = 3000;

const APP = 'dmt_errors';

export default function exceptionNotify(msg, { delay = DEFAULT_DELAY, exitProcess = false, program } = {}) {
  if (msg instanceof Error) {
    msg = msg.stack || msg;
  }

  msg = stripAnsi(msg.toString());

  const done = () => {
    if (exitProcess) {
      exit();
    }
  };

  if (exitProcess) {
    setTimeout(() => {
      setTimeout(() => {
        exit();
      }, delay);

      apn.notify(msg).then(() => {
        exit();
      });
    }, delay);
  }

  if (isMainDevice()) {
    if (log.isForeground()) {
      desktop.notify(msg, dmt.device().id).then(done);
    } else {
      desktop.notify(msg, dmt.device().id).then(() => {
        push
          .optionalApp(APP)
          .omitAppName()
          .highPriority()
          .notify(msg)
          .then(done);
      });
    }
  } else {
    program.notifyMainDevice({ msg, color: '#e34042' });

    push
      .optionalApp(APP)
      .omitAppName()
      .highPriority(!log.isForeground())
      .notify(msg)
      .then(done);
  }
}
