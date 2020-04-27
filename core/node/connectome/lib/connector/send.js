import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

import { isObject, addHeader } from '../channel/sendHelpers';

function send({ data, connector }) {
  if (isObject(data)) {
    data = JSON.stringify(data);
  }

  if (connector.isConnected()) {
    if (connector.sentCounter > 1) {
      let flag = 0;

      if (typeof data == 'string') {
        flag = 1;
      }

      const _encodedMessage = flag == 1 ? nacl.util.decodeUTF8(data) : data;
      const encodedMessage = addHeader(_encodedMessage, flag);

      const encryptedMessage = nacl.secretbox(encodedMessage, nullNonce, connector.sharedSecret);

      if (connector.verbose) {
        console.log('Sending encrypted data:');
        console.log(data);
      }

      connector.connection.websocket.send(encryptedMessage);
    } else {
      if (connector.verbose) {
        console.log('Sending plain-text data:');
        console.log(data);
      }

      connector.connection.websocket.send(data);
    }
    connector.sentCounter += 1;
  } else {
    console.log(`Warning: "${data}" was not sent because the store is not yet connected to the backend`);
  }
}

export default send;
