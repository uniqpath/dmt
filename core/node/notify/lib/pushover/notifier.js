import path from 'path';

import { program, log, isRPi, isLanServer, isDevUser, apMode, colors, util, dmtStateDir } from 'dmt/common';

import { SyncStore } from 'dmt/connectome-stores';

import { dmtApp } from './dmtApp.js';

import * as apn from '../apn.js';
import pushoverApi from './pushoverApi/index.js';
import prepareMessage from './prepareMessage.js';
import getPushoverClient from './getPushoverClient.js';
import checkRemainingLimits from './remainingLimits.js';
import splitTextIntoChunks from './splitTextIntoChunks.js';

const store = new SyncStore(
  {},
  {
    stateFilePath: path.join(dmtStateDir, 'push_messages.json')
  }
);

const slot = store.slot('pushMessages');
slot.makeArray();

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

function trySend({ program, client, pushoverMsgObj, sendingId, message, app, optionalApp, group }, { retries = MAX_RETRIES - 1 } = {}) {
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
          log.red(`Push message #${sendingId} failed (retrying ${retries} more times)`);
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

const NOTIFY_QUEUE = [];

function notify(obj) {
  return new Promise((success, reject) => {
    if (apMode()) {
      log.magenta('Not sending push message in access point (AP) mode:');
      log.gray(obj);
      success();
      return;
    }

    if (obj.bigMessage) {
      const chunks = splitTextIntoChunks(obj.message);

      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          const title = chunks.length == 1 ? obj.title : `${obj.title} ${index + 1}/${chunks.length}`;

          notify({ ...obj, message: chunk, title, bigMessage: false })
            .then(() => {
              if (index == 0) {
                success();
              }
            })
            .catch(reject);
        }, (chunks.length - 1 - index) * 1000);
      });

      return;
    }

    const { group, user, userKey } = obj;

    const targetCount = [group, user, userKey].filter(Boolean).length;

    if (targetCount > 1) {
      delete obj.group;
      delete obj.user;
      delete obj.userKey;

      const promises = [];

      if (group) {
        promises.push(notify({ ...obj, group }));
      }

      if (user) {
        promises.push(notify({ ...obj, user }));
      }

      if (userKey) {
        promises.push(notify({ ...obj, userKey }));
      }

      Promise.all(promises)
        .then(success)
        .catch(reject);
      return;
    }

    if (Array.isArray(obj.group)) {
      for (const group of obj.group) {
        notify({ ...obj, group });
      }

      return;
    }

    if (Array.isArray(obj.user) && !obj.userKey) {
      for (const user of obj.user) {
        notify({ ...obj, user, group: null });
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
      log.cyan(`✉️  Sending push message ${colors.gray(obj.message)} via nearby lanServer`);
      program.nearbyProxyPushMsgViaLanServer(obj);
      success();
      return;
    }

    const sendingId = util.randHex(4);
    NOTIFY_QUEUE.push(sendingId);

    if (isDevUser()) {
      log.gray(
        colors.cyan(`✉️  Sending push message #${sendingId} in ~${NOTIFY_QUEUE.length}s:`),
        Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))
      );
    }

    setTimeout(() => {
      __notify(obj, sendingId)
        .then(_result => {
          setTimeout(() => {
            NOTIFY_QUEUE.splice(NOTIFY_QUEUE.indexOf(sendingId), 1);
          }, 500);

          if (isDevUser()) {
            if (!_result) {
              log.red(`✖ Push message #${sendingId} fail`);
            }
          }

          success(_result);
        })
        .catch(reject);
    }, NOTIFY_QUEUE.length * 500);
  });
}

function __notify(obj, sendingId) {
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

        trySend({ client, pushoverMsgObj, sendingId, message, app, optionalApp, group, program })
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
