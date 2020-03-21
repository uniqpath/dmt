import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import EventEmitter from '../emitter';

import util from '../util';
import RpcClient from '../rpc/client';
import RPCTarget from '../rpc/RPCTarget';

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

const { hexToBuffer, bufferToHex } = util;

class Connector extends EventEmitter {
  constructor({ verbose = false, clientPrivateKey, clientPublicKey } = {}) {
    super();
    this.verbose = verbose;

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;

    this.rpcClient = new RpcClient(this);
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

      this.diffieHellman({ clientPrivateKey: this.clientPrivateKey, clientPublicKey: this.clientPublicKey })
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

      const decryptedMessage = nacl.secretbox.open(encryptedData, nullNonce, this.sharedSecret);
      const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);

      let jsonData;

      try {
        jsonData = JSON.parse(decodedMessage);
      } catch (e) {}

      if (jsonData) {
        if (jsonData.jsonrpc) {
          if (this.verbose) {
            console.log('Received and decrypted rpc result:');
            console.log(jsonData);
          }

          this.wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true });
        } else {
          this.emit('wire_receive', { jsonData, rawMessage: decodedMessage });
        }
      } else {
        this.wireReceive({ binaryData: decodedMessage });
      }
    }
  }

  send(data) {
    if (this.isConnected()) {
      if (this.sentCounter > 1) {
        const encodedMessage = nacl.util.decodeUTF8(data);
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

  diffieHellman({ clientPrivateKey, clientPublicKey }) {
    return new Promise((success, reject) => {
      this.remoteObject('Auth')
        .call('exchangePubkeys', { pubkey: bufferToHex(clientPublicKey) })
        .then(remotePubkey => {
          const sharedSecret = nacl.box.before(hexToBuffer(remotePubkey), clientPrivateKey);
          const sharedSecretHex = bufferToHex(sharedSecret);
          this.sharedSecret = sharedSecret;

          success({ sharedSecret, sharedSecretHex });

          if (this.verbose) {
            console.log('Established shared secret through diffie-hellman exchange:');
            console.log(sharedSecretHex);
          }

          this.remoteObject('Auth')
            .call('exchangePubkeys', { ackResult: true })
            .then(() => {})
            .catch(reject);
        })
        .catch(reject);
    });
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
