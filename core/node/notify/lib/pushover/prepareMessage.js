import dmt from 'dmt/common';

import pushoverApi from './pushoverApi';

import { dmtApp } from './dmtApp';

const deviceId = dmt.device({ onlyBasicParsing: true }).id;

export default function prepareMessage({ message, recipient, title, app, omitDeviceName, network }) {
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
  }

  return new pushoverApi.Message({
    title: messageTitle,
    message,
    enableHtml: false,
    user: recipient,
    priority: new pushoverApi.Priority('low'),
    sound: new pushoverApi.Sound('magic')
  });
}
