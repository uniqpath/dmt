import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { isObject, addHeader } from './sendHelpers.js';
import { integerToByteArray } from '../utils/index.js';

function send({ message, channel }) {
  if (isObject(message)) {
    message = JSON.stringify(message);
  }

  const nonce = new Uint8Array(integerToByteArray(2 * channel.sentCount + 1, 24));

  if (channel.verbose) {
    if (channel.sharedSecret) {
      console.log(`Channel → Sending encrypted message #${channel.sentCount} @ ${channel.remoteAddress()}:`);
    } else {
      console.log(`Channel → Sending message #${channel.sentCount} @ ${channel.remoteAddress()}:`);
    }

    console.log(message);
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
      console.log('Encrypted bytes:');
      console.log(encryptedMessage);
    }
  }

  if (channel.verbose) {
    console.log();
  }

  if (!channel.ws.terminated && channel.ws.readyState == channel.ws.OPEN) {
    channel.ws.send(message);
  } else {
    channel.ws.terminated = true;
  }
}

export default send;
