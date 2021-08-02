import dmt from 'dmt/common';
const { log } = dmt;

import { dmtApp } from './dmtApp';

import * as apn from '../apn';
import pushoverApi from './pushoverApi';
import prepareMessage from './prepareMessage';
import getPushoverClient from './getPushoverClient';

import { userToken, groupToken, getGroupToken } from './pushoverDef';

const user = userToken ? new pushoverApi.User(userToken) : null;
const group = groupToken ? new pushoverApi.Group(groupToken) : null;

function handleError(e, { message, title }) {
  const msg = 'Error sending message over pushover.net API:';

  log.red(msg);
  log.red(e);

  apn.notify(`${dmt.device({ onlyBasicParsing: true }).id}: 😾 ${msg} Check dmt log.`).then(() => {
    apn.push(`Failed msg over apn: ${message}`);
  });
}

function notify(message, { app = dmtApp, title, group, omitDeviceName, network, recipient = user } = {}) {
  return new Promise((success, reject) => {
    if (group) {
      const groupToken = getGroupToken({ app, group });
      if (groupToken) {
        recipient = pushoverApi.Group(groupToken);
      } else {
        notify(`Warning: unknown pushover.def app or group ${app}/${group}`);
      }
    }

    const client = getPushoverClient(app) || getPushoverClient(dmtApp);
    if (user && client) {
      client
        .sendMessage(prepareMessage({ message, title, app, omitDeviceName, network, recipient }))
        .then(success)
        .catch(e => {
          handleError(e, { message, title: app });
          success();
        });
    } else {
      success();
    }
  });
}

async function notifyAll(message, { app = dmtApp, title, omitDeviceName, network } = {}) {
  return notify(message, { app, title, omitDeviceName, network, recipient: group });
}

export { notify, notifyAll };
