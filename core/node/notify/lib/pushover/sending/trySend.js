import { log, isDevUser, colors, program, isMainServer } from 'dmt/common';

import * as apn from '../../apn.js';

function handleError(e, { message, app, group }) {
  const msg = 'Error sending message over pushover.net API:';

  log.red(msg);
  log.red(e.toString());

  const msg2 = `⚠️ℹ️ Msg that failed: "${message}" (app: ${app}${group ? `, group: ${group}` : ''})`;

  log.magenta(msg2);

  apn
    .notify(msg2)
    .then(() => {
      const msg3 = `⚠️⚠️⚠️ 😾 ${msg} Check dmt log and previous apn push msg.`;
      apn.notify(msg3).catch(e => {
        log.red('Problem sending apn message');
        log.red(msg3);
        log.red(e);
      });
    })
    .catch(e => {
      log.red('Problem sending apn message');
      log.red(msg2);
      log.red(e);
    });
}

const MAX_RETRIES = 7;

function getDelay(retries) {
  if (retries == MAX_RETRIES - 1) {
    return 2000;
  }

  if (retries == 2) {
    return 7000;
  }

  if (retries == 1) {
    return 12000;
  }

  return 2500 + Math.random() * 2000;
}

export default function trySend({ program, client, pushoverMsgObj, sendingId, message, app, optionalApp, group }, { retries = MAX_RETRIES - 1 } = {}) {
  return new Promise((success, reject) => {
    const startedAt = Date.now();

    client
      .sendMessage(pushoverMsgObj)
      .then(() => {
        if (retries != MAX_RETRIES - 1) {
          const msg2 = `⚠️ Push message #${sendingId} was successful in retry #${MAX_RETRIES - retries}`;
          log.green(msg2);
          log.gray(pushoverMsgObj);

          apn
            .notify(msg2)
            .then(() => {})
            .catch(e => {
              log.red('Problem sending apn message');
              log.red(msg2);
              log.red(e);
            });
        }

        if (isDevUser()) {
          const duration = Date.now() - startedAt;
          log.gray(`${colors.green('✓')} Push message #${sendingId} sent ⏱️  ${duration}ms`);
        }

        success();
      })
      .catch(e => {
        if (retries == 0) {
          handleError(e, { message, app, group });
          reject();
        } else {
          const msg = `Push message #${sendingId} failed (retrying ${retries} more times)`;
          if (isDevUser() && isMainServer()) {
            setTimeout(() => {
              program.__pushNotify(msg);
            }, 3000);
          }

          log.red(msg);
          log.gray(pushoverMsgObj);

          if (isDevUser()) {
            log.red(e.toString());
          }

          setTimeout(() => {
            trySend({ client, pushoverMsgObj, sendingId, message, app, optionalApp, group, program }, { retries: retries - 1 })
              .then(success)
              .catch(reject);
          }, getDelay(retries));
        }
      });
  });
}
