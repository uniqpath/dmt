import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { integerToByteArray } from '../../utils/index.js';

function messageReceived({ message, channel }) {
  channel.lastMessageAt = Date.now();

  const nonce = new Uint8Array(integerToByteArray(2 * channel.receivedCount, 24));

  if (channel.verbose) {
    console.log(`Channel → Received message #${channel.receivedCount} @ ${channel.remoteAddress()}:`);
  }

  if (channel.sharedSecret) {
    if (channel.verbose == 'extra') {
      console.log('Received bytes:');
      console.log(message);
      console.log(`Decrypting with shared secret ${channel.sharedSecret}...`);
    }

    try {
      const _decryptedMessage = nacl.secretbox.open(message, nonce, channel.sharedSecret);

      const flag = _decryptedMessage[0];
      const decryptedMessage = _decryptedMessage.subarray(1);

      const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);
      message = decodedMessage;
    } catch (e) {
      throw new Error(`${message} -- ${channel.protocol} -- ${e.toString()}`);
    }
  }

  let jsonData;

  try {
    jsonData = JSON.parse(message);
  } catch (e) {
    console.log('JSON Error Message Received ---');
    console.log(message);
    console.log('---');
    return;
  }

  if (channel.verbose) {
    if (channel.sharedSecret) {
      console.log('Decrypted message:');
    }

    console.log(message);
    console.log();
  }

  if (jsonData.jsonrpc) {
    if (Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error')) {
      channel.reverseRpcClient.jsonrpcMsgReceive(message);
    } else {
      channel.emit('json_rpc', message);
    }
  } else if (jsonData.signal) {
    channel.emit(jsonData.signal, jsonData.data);
  } else {
    channel.emit('message', message);
  }
}

export default messageReceived;
