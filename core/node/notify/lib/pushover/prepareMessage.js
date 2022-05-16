import { deviceGeneralIdentifier } from 'dmt/common';

import pushoverApi from './pushoverApi';

import { dmtApp } from './dmtApp';

const deviceId = deviceGeneralIdentifier();

export default function prepareMessage({ message, recipient, title, app, omitDeviceName, network, highPriority, url, urlTitle, isABC }) {
  let messageTitle = title;
  const priority = highPriority ? 'high' : 'low';

  if (!messageTitle) {
    messageTitle = '';

    if (app != dmtApp) {
      messageTitle = app;
    }

    if (!omitDeviceName) {
      if (messageTitle.length > 0) {
        messageTitle = `${messageTitle} · `;
      }

      messageTitle = `${messageTitle}${deviceId}`;
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
