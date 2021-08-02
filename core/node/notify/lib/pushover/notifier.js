import dmt from 'dmt/common';
const { log } = dmt;

import { dmtApp } from './dmtApp';

import * as apn from '../apn';
import pushoverApi from './pushoverApi';
import prepareMessage from './prepareMessage';
import getPushoverClient from './getPushoverClient';

import { getUserToken, getFamilyGroupToken, getAppGroupToken } from './pushoverDef';

function getUser() {
  const userToken = getUserToken();
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
  log.red(e);

  apn.notify(`⚠️ℹ️ Msg that failed: \"${message}\" (app: ${app}${group ? `, group: ${group}` : ''})`).then(() => {
    apn.notify(`⚠️⚠️⚠️ 😾 ${msg} Check dmt log and previous apn push msg.`);
  });
}

function notify(message, { app = dmtApp, title, userKey, group, omitDeviceName, network, recipient = getUser(), url, urlTitle, highPriority, isABC } = {}) {
  return new Promise((success, reject) => {
    if (userKey) {
      recipient = new pushoverApi.User(userKey);
    } else if (group) {
      const groupToken = getAppGroupToken({ app, group });
      if (groupToken) {
        recipient = new pushoverApi.Group(groupToken);
      } else {
        notify(`Warning: unknown pushover.def app or group ${app}/${group}`);
      }
    }

    const client = getPushoverClient(app) || getPushoverClient(dmtApp);
    if (recipient && client) {
      const msg = prepareMessage({ message, title, app, omitDeviceName, network, url, urlTitle, recipient, highPriority, isABC });

      client
        .sendMessage(msg)
        .then(success)
        .catch(e => {
          handleError(e, { message, app, group });
          success();
        });
    } else {
      success();
    }
  });
}

async function notifyAll(message, { app = dmtApp, title, omitDeviceName, network, url, urlTitle, highPriority, isABC } = {}) {
  return notify(message, { app, title, omitDeviceName, network, recipient: getFamilyGroup(), url, urlTitle, highPriority, isABC });
}

export { notify, notifyAll };
