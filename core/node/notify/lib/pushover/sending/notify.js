import crypto from 'crypto';

import { program, log, isRPi, isLanServer, isDevUser, apMode, colors, util, isMainDevice, isMainServer } from 'dmt/common';

import notifyHelper from './notifyHelper.js';

import splitTextIntoChunks from '../splitTextIntoChunks.js';
import getObjHash from '../getObjHash.js';
import getDedupKey from '../getDedupKey.js';
import { store } from '../dedupStore.js';
import { getAppGroupToken, getUserToken } from '../pushoverDef.js';

const slot = store.slot('pushMessages');

function getMessageHash(obj, salt) {
  const str = getObjHash(obj) + salt;

  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}

const NOTIFY_QUEUE = [];

export default function notify(obj) {
  return new Promise((success, reject) => {
    if (apMode()) {
      log.magenta('Not sending push message in access point (AP) mode:');
      log.gray(obj);
      success();
      return;
    }

    if (obj.bigMessage) {
      const chunks = splitTextIntoChunks(obj.message);

      const promises = chunks.map((chunk, index) => {
        return new Promise((resolveChunk, rejectChunk) => {
          setTimeout(() => {
            const title = chunks.length == 1 ? obj.title : `${obj.title} ${index + 1}/${chunks.length}`;

            notify({ ...obj, message: chunk, title, bigMessage: false })
              .then(() => resolveChunk())
              .catch(rejectChunk);
          }, (chunks.length - 1 - index) * 1000);
        });
      });

      Promise.all(promises)
        .then(success)
        .catch(reject);
      return;
    }

    const { user, userKey, app, title, message } = obj;

    if (obj.group?.length > 0 && (userKey?.length > 0 || user?.length > 0)) {
      const promises = [];

      promises.push(notify({ ...obj, group: null }));
      promises.push(notify({ ...obj, userKey: [], user: [] }));

      Promise.all(promises)
        .then(success)
        .catch(reject);
      return;
    }

    if (obj.group?.length > 1) {
      const promises = [];

      for (const group of obj.group) {
        promises.push(notify({ ...obj, group: [group] }));
      }

      Promise.all(promises)
        .then(success)
        .catch(reject);
      return;
    }

    let groupKey;

    const pushoverKeyPattern = /^[a-z0-9]{30}$/i;

    if (obj.group?.length == 1) {
      const group = obj.group[0];

      obj.group = group;

      groupKey = pushoverKeyPattern.test(group) ? group : getAppGroupToken({ app, group });

      if (!groupKey) {
        const _message = `Invalid pushover.def app/group combination <b>${app}/${group}</b>, message <b>${
          title ? `${title} / ` : ''
        }${message}</b> was not delivered to intended recipients.`;
        log.red(_message);
        log.gray(`Undelivered message: ${JSON.stringify(Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)))}`);
        const { originDevice, network, isABC } = obj;
        notify({ title: '❗ Error', message: _message, highPriority: true, enableHtml: true, originDevice, network, isABC }).then(reject);

        return;
      }
    }

    let userKeys = [];

    if (userKey?.length > 0 || user?.length > 0) {
      const _userKeys = Array.isArray(userKey) ? userKey : userKey ? [userKey] : [];
      let userList = Array.isArray(user) ? user : user ? [user] : [];
      _userKeys.push(...userList.filter(u => pushoverKeyPattern.test(u)));
      userList = userList.filter(u => !pushoverKeyPattern.test(u));

      const keys = userList.map(u => {
        const key = getUserToken(u);
        if (!key) {
          throw new Error(`Cannot find user [ ${u} ] in pushover.def`);
        }
        return key;
      });

      const uniqueArray = arr => [...new Set(arr)];

      userKeys = uniqueArray([..._userKeys, ...keys]);

      if (userKeys.length > 50) {
        throw new Error(`Too many users for pushover service (${userKeys.length}), maximum is 50!`);
      }
    }

    if (program && isRPi() && !isLanServer() && program.lanServerNearby()) {
      log.cyan(`✉️  Sending push message ${colors.gray(obj.message)} via nearby lanServer`);
      program.nearbyProxyPushMsgViaLanServer(obj);
      success();
      return;
    }

    const sendingId = util.randHex(6);

    let hash;

    let { dedupKey } = obj;

    if (isDevUser() && isMainDevice()) {
      const comment = 'NOT ACTUALLY SENDING';
      log.write(
        `${colors.magenta('\n==================\n-= PUSH MESSAGE =-\n==================')}\n\n${
          obj.title ? `${colors.yellow(obj.title)}\n\n` : ''
        }${colors.cyan(obj.message)}\n\n${colors.gray(obj)}\n\n[ 👆 ${colors.magenta(comment)} ]\n`
      );
      success();
      return;
    }

    if (isMainServer()) {
      if (!dedupKey) {
        dedupKey = getDedupKey(new Date());
      }

      hash = obj.preHash ? `${obj.preHash}${obj.notifyAll ? 'all' : ''}` : getMessageHash(obj, dedupKey);

      if (slot.get().some(msg => msg.hash === hash)) {
        if (isDevUser()) {
          log.yellow(`✉️  Skipping duplicate message hash=${hash.slice(0, 8)}`);
          if (isDevUser()) {
            log.gray(obj);
          }
        }
        success();
        return;
      }
    }

    const delay = NOTIFY_QUEUE.length * 500;

    NOTIFY_QUEUE.push(sendingId);

    if (isDevUser()) {
      log.gray(
        colors.cyan(`✉️  Sending push message #${sendingId} within ${delay}ms:`),
        Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))
      );
    }

    setTimeout(() => {
      notifyHelper({ ...obj, userKeys, groupKey }, sendingId)
        .then(_result => {
          setTimeout(() => {
            NOTIFY_QUEUE.splice(NOTIFY_QUEUE.indexOf(sendingId), 1);
          }, 500);

          if (isDevUser() && !_result) {
            log.red(`✖ Push message #${sendingId} fail`);
          }

          if (_result && isMainServer()) {
            slot.push({
              hash,
              sendingId,
              dedupKey,
              timestamp: Date.now()
            });
          }

          success();
        })
        .catch(reject);
    }, delay);
  });
}
