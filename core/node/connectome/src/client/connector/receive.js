import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { integerToByteArray } from '../../utils/index.js';

import logger from '../../utils/logger/logger.js';

function isRpcCallResult(jsonData) {
  return Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error');
}

function wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector }) {
  const { log } = connector;

  connector.lastMessageAt = Date.now();

  const nonce = new Uint8Array(integerToByteArray(2 * connector.receivedCount + 1, 24));

  if (connector.verbose && !wasEncrypted) {
    logger.write(log);
    logger.magenta(log, `Connector ${connector.remoteAddress()} → Received message #${connector.receivedCount} ↴`);
  }

  // unencrypted jsonData !
  if (jsonData) {
    if (jsonData.jsonrpc) {
      if (isRpcCallResult(jsonData)) {
        if (connector.verbose && !wasEncrypted) {
          logger.magenta(log, `Connector ${connector.remoteAddress()} received plain-text rpc result ↴`);
          logger.gray(log, jsonData);
        }

        connector.rpcClient.jsonrpcMsgReceive(rawMessage);
      } else {
        connector.emit('json_rpc', rawMessage);
      }
    } else {
      connector.emit('receive', { jsonData, rawMessage });
    }
  } else if (encryptedData) {
    // encryptedJson data!!
    if (connector.verbose == 'extra') {
      logger.magenta(log, `Connector ${connector.remoteAddress()} received bytes ↴`);
      logger.gray(log, encryptedData);
      logger.magenta(log, `Connector ${connector.remoteAddress()} decrypting with shared secret ${connector.sharedSecret}...`);
    }

    const _decryptedMessage = nacl.secretbox.open(encryptedData, nonce, connector.sharedSecret);

    const flag = _decryptedMessage[0];
    const decryptedMessage = _decryptedMessage.subarray(1);

    if (flag == 1) {
      const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);

      try {
        const jsonData = JSON.parse(decodedMessage);

        // rpc
        if (jsonData.jsonrpc) {
          if (connector.verbose) {
            logger.magenta(log, `Connector ${connector.remoteAddress()} decrypted rpc result ↴`);
            logger.gray(log, jsonData);
          }

          wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true, connector });
          //   // tag
        } else if (jsonData.state) {
          // Initial state sending ... part of Connectome protocol
          connector.emit('receive_state', jsonData.state);
        } else if (jsonData.diff) {
          // Subsequent JSON patch diffs (rfc6902)* ... part of Connectome protocol
          connector.emit('receive_diff', jsonData.diff);
        } else if (jsonData.signal) {
          connector.emit(jsonData.signal, jsonData.data);
        } else if (jsonData.stateField) {
          connector.emit('receive_state_field', jsonData.stateField);
        } else {
          connector.emit('receive', { jsonData, rawMessage: decodedMessage });
        }
      } catch (e) {
        logger.red(log, "Couldn't parse json message although the flag was for string ...");
        logger.red(log, decodedMessage);
        throw e;
      }
    } else {
      connector.emit('receive_binary', decryptedMessage);
    }
  }
}

export default wireReceive;
