import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { isObject, addHeader } from './sendHelpers.js';
import { integerToByteArray } from '../../utils/index.js';

import logger from '../../utils/logger/logger.js';

function send({ message, channel }) {
  const { log } = channel;

  if (isObject(message)) {
    message = JSON.stringify(message);
  }

  const nonce = new Uint8Array(integerToByteArray(2 * channel.sentCount + 1, 24));

  if (channel.verbose) {
    if (channel.sharedSecret) {
      logger.write(log, `Channel ${channel.remoteAddress()} → Sending encrypted message #${channel.sentCount}:`);
    } else {
      logger.write(log, `Channel ${channel.remoteAddress()} → Sending message #${channel.sentCount}:`);
    }

    logger.write(log, message);
  }

  if (channel.sharedSecret) {
    let flag = 0;

    if (typeof message == 'string') {
      flag = 1;
    }

    const _encodedMessage = flag == 1 ? nacl.util.decodeUTF8(message) : message;
    const encodedMessage = addHeader(_encodedMessage, flag);

    const encryptedMessage = nacl.secretbox(encodedMessage, nonce, channel.sharedSecret);
    message = encryptedMessage;

    if (channel.verbose == 'extra') {
      logger.write(log, 'Encrypted bytes:');
      logger.write(log, encryptedMessage);
    }
  }

  if (!channel.ws.terminated && channel.ws.readyState == channel.ws.OPEN) {
    channel.ws.send(message);
  } else {
    channel.ws.terminated = true;
  }
}

export default send;
