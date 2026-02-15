import { program, log, isDevUser, isMainDevice, isMainServer, util } from 'dmt/common';

import { dmtApp } from '../dmtApp.js';

import { User, Group } from '../pushoverApi/index.js';
import prepareMessage from './prepareMessage.js';
import getPushoverClient from '../getPushoverClient.js';
import checkRemainingLimits from '../remainingLimits.js';
import trySend from './trySend.js';

const FAMILY_SYMBOL = '👨‍👩‍👦‍👦';

import { getMainUserToken, getFamilyGroupToken } from '../pushoverDef.js';

function getPushoverUserApi() {
  const userToken = getMainUserToken();
  if (userToken) {
    return new User(userToken);
  }
}

function getPushoverFamilyGroupApi() {
  const groupToken = getFamilyGroupToken();
  if (groupToken) {
    return new Group(groupToken);
  }
}

function reportError(obj) {
  const { app, title, message, originDevice, network, isABC } = obj;
  const errorMsg = `Unknown pushover.def app <b>${app}</b>, message <b>${title ? `${title} / ` : ''}</b><b>${message}</b> was not delivered.`;
  log.red(errorMsg);
  const sendingId = util.randHex(6);
  notifyHelper({ title: '❗ Error', message: errorMsg, userKeys: [], highPriority: true, enableHtml: true, originDevice, network, isABC }, sendingId);
}

export default function notifyHelper(obj, sendingId) {
  return new Promise((success, reject) => {
    if (!getMainUserToken()) {
      success(true);
    }
    obj.app = obj.app || dmtApp;

    const {
      app,
      optionalApp,
      title,
      message,
      userKeys,
      groupKey,
      group,
      sound,
      omitDeviceName,
      omitAppName,
      network,
      url,
      urlTitle,
      ttl,
      highPriority,
      lowPriority,
      enableHtml,
      isABC,
      notifyAll,
      originDevice
    } = obj;

    let recipient;

    if (userKeys.length > 0) {
      if (userKeys.length > 50) {
        throw new Error(`Too many users for pushover service (${userKeys.length}), maximum is 50!`);
      }

      recipient = new User(userKeys.join(','));
    } else if (groupKey) {
      recipient = new Group(groupKey);
    } else if (notifyAll) {
      recipient = getPushoverFamilyGroupApi() || getPushoverUserApi();
    } else {
      recipient = getPushoverUserApi();
    }

    if (!recipient) {
      log.red('No pushover recipient defined');
      success(true);
      return;
    }

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
        ttl,
        recipient,
        sound,
        highPriority,
        lowPriority,
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
      reportError(obj);
      success(false);
    }
  });
}
