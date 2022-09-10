import { deviceGeneralIdentifier, device } from 'dmt/common';

import pushoverApi from './pushoverApi';

import { dmtApp } from './dmtApp';

const deviceId = deviceGeneralIdentifier();

function getMessageTitle({ title, app, network, deviceName, omitDeviceName, isABC, originDevice }) {
  let messageTitle = title;

  if (!messageTitle) {
    messageTitle = '';

    if (app != dmtApp) {
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
        messageTitle = `${messageTitle} @ `;
      } else if (messageTitle.length > 0) {
        messageTitle = `${messageTitle} · `;
      }

      messageTitle = `${messageTitle}${network}`;
    }

    if (isABC) {
      messageTitle = `ABC · ${messageTitle}`;
    }
  }

  return messageTitle;
}

export default function prepareMessage({ message, recipient, title, app, omitDeviceName, network, highPriority, url, urlTitle, isABC, originDevice }) {
  const deviceName = originDevice || deviceId;

  const messageTitle = getMessageTitle({ title, app, network, deviceName, omitDeviceName, isABC, originDevice });
  const priority = highPriority ? 'high' : 'low';

  return new pushoverApi.Message({
    title: messageTitle,
    url,
    urlTitle,
    message,
    enableHtml: false,
    user: recipient,
    priority: new pushoverApi.Priority(priority),
    sound: new pushoverApi.Sound('magic')
  });
}
