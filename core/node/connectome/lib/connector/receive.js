import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import { integerToByteArray } from '../utils/index.js';

function isRpcCallResult(jsonData) {
  return Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error');
}

function wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector }) {
  const nonce = new Uint8Array(integerToByteArray(2 * connector.receivedCount + 1, 24));

  if (connector.verbose && !wasEncrypted) {
    console.log();
    console.log(`Connector → Received message #${connector.receivedCount} @ ${connector.address}:`);
  }

  // 💡 unencrypted jsonData !
  if (jsonData) {
    if (jsonData.jsonrpc) {
      if (isRpcCallResult(jsonData)) {
        if (connector.verbose && !wasEncrypted) {
          console.log('Received plain-text rpc result');
          console.log(jsonData);
        }

        connector.rpcClient.jsonrpcMsgReceive(rawMessage);
      } else {
        connector.emit('json_rpc', rawMessage);
      }
    } else {
      connector.emit('receive', { jsonData, rawMessage });
    }
  } else if (encryptedData) {
    // 💡 encryptedJson data!!
    if (connector.verbose == 'extra') {
      console.log('Received bytes:');
      console.log(encryptedData);
      console.log(`Decrypting with shared secret ${connector.sharedSecret}...`);
    }

    const _decryptedMessage = nacl.secretbox.open(encryptedData, nonce, connector.sharedSecret);

    const flag = _decryptedMessage[0];
    const decryptedMessage = _decryptedMessage.subarray(1);

    if (flag == 1) {
      const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);

      try {
        const jsonData = JSON.parse(decodedMessage);

        // 💡 rpc
        if (jsonData.jsonrpc) {
          if (connector.verbose) {
            console.log('Received and decrypted rpc result:');
            console.log(jsonData);
          }

          wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true, connector });
        } else if (jsonData.tag) {
          // 💡 tag
          const msg = jsonData;

          if (msg.tag == 'file_not_found') {
            connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
          } else if (msg.tag == 'binary_start') {
            connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
          } else if (msg.tag == 'binary_end') {
            connector.emit(msg.tag, { sessionId: msg.sessionId });
          } else {
            connector.emit('receive', { jsonData, rawMessage: decodedMessage });
          }
        } else if (jsonData.state) {
          // 💡 Initial state sending ... part of Connectome protocol
          connector.emit('receive_state', jsonData.state);
        } else if (jsonData.diff) {
          // 💡 Subsequent JSON patch diffs (rfc6902)* ... part of Connectome protocol
          connector.emit('receive_diff', jsonData.diff);
        } else {
          connector.emit('receive', { jsonData, rawMessage: decodedMessage });
        }
      } catch (e) {
        console.log("Couldn't parse json message although the flag was for string ...");
        throw e;
      }
    } else {
      const binaryData = decryptedMessage;

      const sessionId = Buffer.from(binaryData.buffer, binaryData.byteOffset, 64).toString();
      const binaryPayload = Buffer.from(binaryData.buffer, binaryData.byteOffset + 64);

      connector.emit('binary_data', { sessionId, data: binaryPayload });
    }
  }
}

export default wireReceive;
