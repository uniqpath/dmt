import { deviceGeneralIdentifier } from 'dmt/common';

import { Message, PRIORITY, SOUND } from '../pushoverApi/index.js';

import { dmtApp } from '../dmtApp.js';

const MAX_TITLE_CHARS = 100;

const deviceId = deviceGeneralIdentifier();

function getMessageTitle({ title, app, network, deviceName, omitDeviceName, omitAppName, isABC, originDevice }) {
  let messageTitle = title;

  if (!messageTitle) {
    messageTitle = '';

    if (app != dmtApp && !omitAppName) {
      messageTitle = app;
    }

    if (!omitDeviceName) {
      if (messageTitle.length > 0) {
        messageTitle = `${messageTitle} · `;
      }

      messageTitle = `${messageTitle}${deviceName}`;
    }

    if (network) {
      if (!omitDeviceName) {
        messageTitle = `${messageTitle} @ ${network}`;
      } else if (messageTitle.length > 0 && messageTitle != network) {
        messageTitle = `${messageTitle} @ ${network}`;
      }
    }

    if (isABC) {
      messageTitle = `ABC · ${messageTitle}`;
    }
  }

  return messageTitle;
}

export default function prepareMessage({
  message,
  recipient,
  title,
  app,
  omitDeviceName,
  omitAppName,
  network,
  highPriority,
  lowPriority,
  sound,
  url,
  urlTitle,
  ttl,
  isABC,
  originDevice,
  enableHtml
}) {
  if (!message) {
    throw new Error(`did not supply message to send, title: ${title}`);
  }

  const deviceName = originDevice || deviceId;

  const messageTitle = getMessageTitle({ title, app, network, deviceName, omitDeviceName, omitAppName, isABC, originDevice });
  return new Message({
    title: messageTitle ? messageTitle.toString().substring(0, MAX_TITLE_CHARS) : null,
    url,
    urlTitle,
    message: message instanceof Error ? message.toString() : message,
    enableHtml: enableHtml ? 1 : 0,
    user: recipient,
    ttl: ttl ? Math.round(ttl / 1000) : undefined,
    priority: highPriority ? PRIORITY.high : lowPriority ? PRIORITY.low : PRIORITY.normal,
    sound: sound || (highPriority ? SOUND.magic : SOUND.none)
  });
}
