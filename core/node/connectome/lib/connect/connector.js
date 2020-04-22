import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import EventEmitter from '../emitter';

import util from '../util';
import RpcClient from '../rpc/client';
import RPCTarget from '../rpc/RPCTarget';

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

const { hexToBuffer, bufferToHex } = util;

function isObject(obj) {
  return obj !== undefined && obj !== null && obj.constructor == Object;
}

class Connector extends EventEmitter {
  constructor({ protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose = false, address } = {}) {
    super();

    this.protocolLane = protocolLane;

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;
    this.clientPublicKeyHex = bufferToHex(clientPublicKey);

    this.clientInitData = clientInitData;

    this.rpcClient = new RpcClient(this);

    this.address = address;
    this.verbose = verbose;
  }

  isConnected() {
    return this.connected;
  }

  closed() {
    return !this.isConnected();
  }

  connectStatus(connected) {
    this.connected = connected;

    if (connected) {
      this.sentCounter = 0;

      this.diffieHellman({ clientPrivateKey: this.clientPrivateKey, clientPublicKey: this.clientPublicKey, protocolLane: this.protocolLane })
        .then(({ sharedSecret, sharedSecretHex }) => {
          this.emit('connected', { sharedSecret, sharedSecretHex });
        })
        .catch(e => {
          console.log(e);
          console.log('dropping connection and retrying again ...');
          this.close();
        });
    } else {
      this.emit('disconnected');
    }
  }

  wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted }) {
    if (jsonData) {
      if (jsonData.jsonrpc) {
        if (Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error')) {
          if (this.verbose && !wasEncrypted) {
            console.log('Received plain-text rpc result');
            console.log(jsonData);
          }

          this.rpcClient.jsonrpcMsgReceive(rawMessage);
        } else {
          this.emit('json_rpc', rawMessage);
        }
      } else {
        this.emit('wire_receive', { jsonData, rawMessage });
      }
    } else if (encryptedData) {
      if (this.verbose == 'extra') {
        console.log('Received bytes:');
        console.log(encryptedData);
        console.log(`Decrypting with shared secret ${this.sharedSecret}...`);
      }

      const _decryptedMessage = nacl.secretbox.open(encryptedData, nullNonce, this.sharedSecret);

      const flag = _decryptedMessage[0];
      const decryptedMessage = _decryptedMessage.subarray(1);

      if (flag == 1) {
        const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);

        try {
          const jsonData = JSON.parse(decodedMessage);

          if (jsonData.jsonrpc) {
            if (this.verbose) {
              console.log('Received and decrypted rpc result:');
              console.log(jsonData);
            }

            this.wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true });
          } else if (jsonData.tag) {
            const msg = jsonData;

            if (msg.tag == 'binary_start') {
              this.emit(msg.tag, { ...msg, ...{ tag: undefined } });
            } else if (msg.tag == 'binary_end') {
              this.emit(msg.tag, { sessionId: msg.sessionId });
            } else {
              this.emit('wire_receive', { jsonData, rawMessage: decodedMessage });
            }
          } else {
            this.emit('wire_receive', { jsonData, rawMessage: decodedMessage });
          }
        } catch (e) {
          console.log("Couldn't parse json message although the flag was for string ...");
          throw e;
        }
      } else {
        const binaryData = decryptedMessage;

        const sessionId = Buffer.from(binaryData.buffer, binaryData.byteOffset, 64).toString();
        const binaryPayload = Buffer.from(binaryData.buffer, binaryData.byteOffset + 64);

        this.emit('binary_data', { sessionId, data: binaryPayload });
      }
    }
  }

  addHeader(_msg, flag) {
    const msg = new Uint8Array(_msg.length + 1);

    const header = new Uint8Array(1);
    header[0] = flag;

    msg.set(header);
    msg.set(_msg, header.length);

    return msg;
  }

  send(data) {
    if (isObject(data)) {
      data = JSON.stringify(data);
    }

    if (this.isConnected()) {
      if (this.sentCounter > 1) {
        let flag = 0;

        if (typeof data == 'string') {
          flag = 1;
        }

        const _encodedMessage = flag == 1 ? nacl.util.decodeUTF8(data) : data;
        const encodedMessage = this.addHeader(_encodedMessage, flag);

        const encryptedMessage = nacl.secretbox(encodedMessage, nullNonce, this.sharedSecret);

        if (this.verbose) {
          console.log('Sending encrypted data:');
          console.log(data);
        }

        this.connection.websocket.send(encryptedMessage);
      } else {
        if (this.verbose) {
          console.log('Sending plain-text data:');
          console.log(data);
        }

        this.connection.websocket.send(data);
      }
      this.sentCounter += 1;
    } else {
      console.log(`Warning: "${data}" was not sent because the store is not yet connected to the backend`);
    }
  }

  remoteObject(handle) {
    return {
      call: (methodName, params = []) => {
        return this.rpcClient.remoteObject(handle).call(methodName, util.listify(params));
      }
    };
  }

  registerRemoteObject(handle, obj) {
    new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
  }

  diffieHellman({ clientPrivateKey, clientPublicKey, protocolLane }) {
    return new Promise((success, reject) => {
      this.remoteObject('Auth')
        .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
        .then(remotePubkey => {
          const sharedSecret = nacl.box.before(hexToBuffer(remotePubkey), clientPrivateKey);
          const sharedSecretHex = bufferToHex(sharedSecret);
          this.sharedSecret = sharedSecret;

          this.remotePubkeyHex = remotePubkey;

          success({ sharedSecret, sharedSecretHex });

          if (this.verbose) {
            console.log('Established shared secret through diffie-hellman exchange:');
            console.log(sharedSecretHex);
          }

          this.remoteObject('Auth')
            .call('finalizeHandshake', { protocolLane, expectHelloData: !!this.clientInitData })
            .then(() => {
              if (this.clientInitData) {
                this.remoteObject('Hello')
                  .call('hello', this.clientInitData)
                  .catch(reject);
              }
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  clientPubkey() {
    return this.clientPublicKeyHex;
  }

  remotePubkey() {
    return this.remotePubkeyHex;
  }

  remoteIp() {
    return this.address;
  }

  close() {
    this.connection.websocket.close();
  }

  closeAndDontReopenUNUSED() {
    this.connection.closedManually = true;
    this.connection.websocket.onclose = () => {};

    this.connectStatus(false);
    this.connection.websocket.close();
  }
}

export default Connector;
