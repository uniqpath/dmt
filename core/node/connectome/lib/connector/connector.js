import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send';
import receive from './receive';

import { EventEmitter, listify, hexToBuffer, bufferToHex } from '../utils';

import RpcClient from '../rpc/client';
import RPCTarget from '../rpc/RPCTarget';

class Connector extends EventEmitter {
  constructor({ protocolLane, clientPrivateKey, clientPublicKey, clientInitData, rpcRequestTimeout, verbose = false, address } = {}) {
    super();

    this.protocolLane = protocolLane;

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;
    this.clientPublicKeyHex = bufferToHex(clientPublicKey);

    this.clientInitData = clientInitData;

    this.rpcClient = new RpcClient(this, rpcRequestTimeout);

    this.address = address;
    this.verbose = verbose;
  }

  isConnected() {
    return this.connected;
  }

  send(data) {
    send({ data, connector: this });
  }

  wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted }) {
    receive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector: this });
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

  remoteObject(handle) {
    return {
      call: (methodName, params = []) => {
        return this.rpcClient.remoteObject(handle).call(methodName, listify(params));
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
