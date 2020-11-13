import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send.js';
import receive from './receive.js';

import { EventEmitter, listify, hexToBuffer, bufferToHex } from '../utils/index.js';

import RpcClient from '../rpc/client.js';
import RPCTarget from '../rpc/RPCTarget.js';

class Connector extends EventEmitter {
  constructor({ address, protocol, protocolLane, clientPrivateKey, clientPublicKey, rpcRequestTimeout, verbose = false } = {}) {
    super();

    this.protocol = protocol;
    this.protocolLane = protocolLane;

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;
    this.clientPublicKeyHex = bufferToHex(clientPublicKey);

    this.rpcClient = new RpcClient(this, rpcRequestTimeout);

    this.address = address;
    this.verbose = verbose;

    this.sentCount = 0;
    this.receivedCount = 0;

    this.successfulConnectsCount = 0;
  }

  send(data) {
    send({ data, connector: this });
    this.sentCount += 1;
  }

  wireReceive({ jsonData, encryptedData, rawMessage }) {
    receive({ jsonData, encryptedData, rawMessage, connector: this });
    this.receivedCount += 1;
  }

  isReady() {
    return this.ready;
  }

  closed() {
    return !this.connected;
  }

  decommission() {
    this.decommissioned = true;
  }

  connectStatus(connected) {
    if (connected) {
      this.sentCount = 0;
      this.receivedCount = 0;

      this.connected = true;

      console.log(`Connector ${this.address} CONNECTED`);

      this.successfulConnectsCount += 1;

      const num = this.successfulConnectsCount;

      this.diffieHellman({ clientPrivateKey: this.clientPrivateKey, clientPublicKey: this.clientPublicKey, protocolLane: this.protocolLane })
        .then(({ sharedSecret, sharedSecretHex }) => {
          this.ready = true;
          this.connectedAt = Date.now();

          this.emit('ready', { sharedSecret, sharedSecretHex });

          console.log(`Connector ${this.address} READY`);
        })
        .catch(e => {
          if (num == this.successfulConnectsCount) {
            console.log(e);
            console.log('dropping connection and retrying again');
            this.connection.terminate();
          }
        });
    } else {
      if (this.connected) {
        this.emit('disconnected');
      }

      console.log(`Connector ${this.address} DISCONNECTED, setting READY to false`);

      this.connected = false;
      this.ready = false;
      delete this.connectedAt;
    }
  }

  remoteObject(handle) {
    return {
      call: (methodName, params = []) => {
        return this.rpcClient.remoteObject(handle).call(methodName, listify(params));
      }
    };
  }

  attachObject(handle, obj) {
    new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
  }

  diffieHellman({ clientPrivateKey, clientPublicKey, protocolLane }) {
    return new Promise((success, reject) => {
      this.remoteObject('Auth')
        .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
        .then(remotePubkeyHex => {
          const sharedSecret = nacl.box.before(hexToBuffer(remotePubkeyHex), clientPrivateKey);
          const sharedSecretHex = bufferToHex(sharedSecret);
          this.sharedSecret = sharedSecret;

          this._remotePubkeyHex = remotePubkeyHex;

          success({ sharedSecret, sharedSecretHex });

          if (this.verbose) {
            console.log('Established shared secret through diffie-hellman exchange:');
            console.log(sharedSecretHex);
          }

          this.remoteObject('Auth')
            .call('finalizeHandshake', { protocolLane })
            .then(() => {})
            .catch(reject);
        })
        .catch(reject);
    });
  }

  clientPubkey() {
    return this.clientPublicKeyHex;
  }

  remotePubkeyHex() {
    return this._remotePubkeyHex;
  }

  remoteAddress() {
    return this.address;
  }
}

export default Connector;
