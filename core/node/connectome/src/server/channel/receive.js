import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { integerToByteArray } from '../../utils/index.js';

import logger from '../../utils/logger/logger.js';

function handleMessage(channel, message) {
  const { log } = channel;

  let jsonData;

  try {
    jsonData = JSON.parse(message);
  } catch (e) {
    logger.red(log, 'Error: Message should be json !');
    logger.red(log, message);
    logger.red(log, message.toString());
    throw e;
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
  const { log } = channel;

  channel.lastMessageAt = Date.now();

  const nonce = new Uint8Array(integerToByteArray(2 * channel.receivedCount, 24));

  if (channel.verbose) {
    logger.write(log, `Channel ${channel.remoteAddress()} → Received message #${channel.receivedCount} ↴`);
  }

  let decodedMessage;

  try {
    if (!channel.sharedSecret) {
      handleMessage(channel, message);
      return;
    }

    const _decryptedMessage = nacl.secretbox.open(message, nonce, channel.sharedSecret);

    const flag = _decryptedMessage[0];
    const decryptedMessage = _decryptedMessage.subarray(1);

    if (channel.verbose) {
      logger.write(log, `decryptedMessage: ${decryptedMessage}`);
    }

    if (flag == 1) {
      decodedMessage = nacl.util.encodeUTF8(decryptedMessage);

      if (channel.verbose) {
        logger.write(log, `Message: ${decodedMessage}`);
      }

      handleMessage(channel, decodedMessage);
    } else {
      channel.emit('receive_binary', decryptedMessage);
    }
  } catch (e) {
    throw new Error(
      `${e.toString()} \n-- Protocol ${channel.protocol} received channel message: ${decodedMessage} \n-- Stacktrace: ${
        e.stack
      }\n------ ↑ original stacktrace ------ `
    );
  }
}

export default messageReceived;
