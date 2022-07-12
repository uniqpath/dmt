import * as dmt from 'dmt/common';
const { log, isMainDevice } = dmt;

import { push, desktop } from 'dmt/notify';

export default function exceptionNotify({ program, msg }) {
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
      program.notifyMainDevice({ msg });

      push
        .highPriority(!log.isForeground())
        .notify(msg)
        .then(success);
    }
  });
}
