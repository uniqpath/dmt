import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { integerToByteArray } from '../../utils/index.js';

function handleMessage(channel, message) {
  let jsonData;

  try {
    jsonData = JSON.parse(message);
  } catch (e) {
    console.log('Error: Message should be json !');
    console.log(message);
    console.log('---');
    return;
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
    channel.emit('receive', message);
  }
}

function messageReceived({ message, channel }) {
  channel.lastMessageAt = Date.now();

  const nonce = new Uint8Array(integerToByteArray(2 * channel.receivedCount, 24));

  if (channel.verbose) {
    console.log(`Channel → Received message #${channel.receivedCount} @ ${channel.remoteAddress()}:`);
  }

  try {
    if (!channel.sharedSecret) {
      handleMessage(channel, message);
      return;
    }

    const _decryptedMessage = nacl.secretbox.open(message, nonce, channel.sharedSecret);

    const flag = _decryptedMessage[0];
    const decryptedMessage = _decryptedMessage.subarray(1);

    if (flag == 1) {
      const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);
      if (channel.verbose) {
        console.log(`Message: ${decodedMessage}`);
      }

      handleMessage(channel, decodedMessage);
    } else {
      channel.emit('receive_binary', decryptedMessage);
    }
  } catch (e) {
    throw new Error(`${message} -- ${channel.protocol} -- ${e.toString()}`);
  }
}

export default messageReceived;
