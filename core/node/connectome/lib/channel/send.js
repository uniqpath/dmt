import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { isObject, addHeader } from './sendHelpers';

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

function send({ message, channel }) {
  if (isObject(message)) {
    message = JSON.stringify(message);
  }

  if (channel.verbose) {
    if (channel.sharedSecret) {
      console.log('Sending encrypted message:');
    } else {
      console.log('Sending message:');
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

    const encryptedMessage = nacl.secretbox(encodedMessage, nullNonce, channel.sharedSecret);
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
    channel.sentMessageCount += 1;
    channel.ws.send(message);
  } else {
    channel.ws.terminated = true;
  }
}

export default send;
