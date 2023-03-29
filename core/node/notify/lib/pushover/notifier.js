import { program, log, isRPi, isLanServer, isDevUser, apMode, colors } from 'dmt/common';

import { dmtApp } from './dmtApp.js';

import * as apn from '../apn.js';
import pushoverApi from './pushoverApi/index.js';
import prepareMessage from './prepareMessage.js';
import getPushoverClient from './getPushoverClient.js';
import checkRemainingLimits from './remainingLimits.js';

import { getMainUserToken, getFamilyGroupToken, getAppGroupToken, getUserToken } from './pushoverDef.js';

function getUser() {
  const userToken = getMainUserToken();
  if (userToken) {
    return new pushoverApi.User(userToken);
  }
}

function getFamilyGroup() {
  const groupToken = getFamilyGroupToken();
  if (groupToken) {
    return new pushoverApi.Group(groupToken);
  }
}

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

function trySend({ program, client, pushoverMsgObj, message, app, optionalApp, group }, { retries = MAX_RETRIES - 1 } = {}) {
  return new Promise((success, reject) => {
    const startedAt = Date.now();

    client
      .sendMessage(pushoverMsgObj)
      .then(() => {
        if (retries != MAX_RETRIES - 1) {
          const msg2 = `⚠️ Push message was successful in retry #${MAX_RETRIES - retries}`;
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
          log.cyan(`Push message took ${duration}ms to send`);
        }

        success();
      })
      .catch(e => {
        if (retries == 0) {
          handleError(e, { message, app, group });
          reject();
        } else {
          log.red(`Push message failed (retrying ${retries} more times)`);
          log.gray(pushoverMsgObj);

          if (isDevUser()) {
            log.red(e.toString());
          }

          setTimeout(() => {
            trySend({ client, pushoverMsgObj, message, app, optionalApp, group, program }, { retries: retries - 1 })
              .then(success)
              .catch(reject);
          }, getDelay(retries));
        }
      });
  });
}

const NOTIFY_QUEUE = [];

function notify(obj) {
  return new Promise((success, reject) => {
    if (apMode()) {
      log.magenta('Not sending push message in access point (AP) mode:');
      log.gray(obj);
      success();
      return;
    }

    if (Array.isArray(obj.user) && !obj.userKey) {
      for (const user of obj.user) {
        notify({ ...obj, user });
      }

      return;
    }

    if (Array.isArray(obj.userKey)) {
      for (const userKey of obj.userKey) {
        notify({ ...obj, userKey });
      }

      return;
    }

    if (program && isRPi() && !isLanServer() && program.lanServerNearby()) {
      log.cyan(`Sending push message ${colors.gray(obj.message)} via nearby lanServer`);
      program.nearbyProxyPushMsgViaLanServer(obj);
      success();
      return;
    }

    const sendingId = Math.random();
    NOTIFY_QUEUE.push(sendingId);

    if (isDevUser()) {
      log.cyan(`Sending push message with id ${sendingId} in ${NOTIFY_QUEUE.length}s`);
      log.gray(obj);
    }

    setTimeout(() => {
      __notify(obj)
        .then(_result => {
          setTimeout(() => {
            NOTIFY_QUEUE.splice(NOTIFY_QUEUE.indexOf(sendingId), 1);
          }, 500);

          if (isDevUser()) {
            if (_result) {
              log.green(`Push message ${sendingId} success`);
            } else {
              log.red(`Push message ${sendingId} fail`);
            }
          }

          success(_result);
        })
        .catch(reject);
    }, NOTIFY_QUEUE.length * 500);
  });
}

function __notify(obj) {
  return new Promise((success, reject) => {
    let ok = true;

    obj.app = obj.app || dmtApp;

    const {
      app,
      optionalApp,
      title,
      message,
      userKey,
      user,
      group,
      omitDeviceName,
      omitAppName,
      network,
      url,
      urlTitle,
      highPriority,
      enableHtml,
      isABC,
      notifyAll,
      originDevice
    } = obj;

    let recipient = notifyAll ? getFamilyGroup() || getUser() : getUser();

    if (userKey && user) {
      throw new Error(`user=${user} and userKey=${userKey}, please provide only one and not both!`);
    }

    if (userKey) {
      recipient = new pushoverApi.User(userKey);
    } else if (user) {
      const key = getUserToken(user);
      if (!key) {
        throw new Error(`Cannot find user [ ${user} ] in pushover.def`);
      }
      recipient = new pushoverApi.User(key);
    } else if (group) {
      const groupToken = getAppGroupToken({ app, group });
      if (groupToken) {
        recipient = new pushoverApi.Group(groupToken);
      } else {
        const _message = `Invalid pushover.def app/group combination <b>${app}/${group}</b>, message <b>${
          title ? `${title} / ` : ''
        }${message}</b> was not delivered to intended recipients.`;
        log.red(_message);
        notify({ title: '❗ Error', message: _message, highPriority: true, enableHtml: true, originDevice, network, isABC });

        ok = false;
      }
    }

    if (ok) {
      let client = getPushoverClient(app);

      if (!client && optionalApp) {
        client = getPushoverClient(dmtApp);
      }

      if (recipient && client) {
        const pushoverMsgObj = prepareMessage({
          message,
          title,
          app,
          omitDeviceName,
          omitAppName,
          network,
          url,
          urlTitle,
          recipient,
          highPriority,
          enableHtml,
          isABC,
          originDevice
        });

        trySend({ client, pushoverMsgObj, message, app, optionalApp, group, program })
          .then(() => {
            success(true);
            checkRemainingLimits(app, client);
          })
          .catch(() => success(false));
      } else {
        const _message = `Unknown pushover.def app <b>${app}</b>, message <b>${title ? `${title} / ` : ''}</b><b>${message}</b> was not delivered.`;
        log.red(_message);
        notify({ title: '❗ Error', message: _message, highPriority: true, enableHtml: true, originDevice, network, isABC });
        success(true);
      }
    }
  });
}

async function notifyAll(obj) {
  return notify({ ...obj, notifyAll: true });
}

export { notify, notifyAll };
