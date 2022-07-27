import * as dmt from 'dmt/common';
const { log, isMainDevice } = dmt;

import { push, desktop } from 'dmt/notify';

export default function exceptionNotify({ program, msg }) {
  msg = msg.toString();

  return new Promise((success, reject) => {
    if (isMainDevice()) {
      if (log.isForeground()) {
        desktop.notify(msg, dmt.device().id).then(success);
      } else {
        desktop.notify(msg, dmt.device().id).then(() => {
          push
            .highPriority()
            .notify(msg)
            .then(success);
        });
      }
    } else {
      program.notifyMainDevice({ msg, color: '#e34042' });

      push
        .highPriority(!log.isForeground())
        .notify(msg)
        .then(success);
    }
  });
}
