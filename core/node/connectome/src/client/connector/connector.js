import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send.js';
import receive from './receive.js';

import { EventEmitter, listify, hexToBuffer, bufferToHex } from '../../utils/index.js';

import RpcClient from '../rpc/client.js';
import RPCTarget from '../rpc/RPCTarget.js';

import { newKeypair, acceptKeypair } from '../../utils/crypto/index.js';

class Connector extends EventEmitter {
  constructor({ address, protocol, lane, keypair = newKeypair(), rpcRequestTimeout, verbose = false, tag } = {}) {
    super();

    this.protocol = protocol;
    this.lane = lane;

    const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = acceptKeypair(keypair);

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;
    this.clientPublicKeyHex = bufferToHex(clientPublicKey);

    this.rpcClient = new RpcClient(this, rpcRequestTimeout);

    this.address = address;
    this.verbose = verbose;
    this.tag = tag;

    this.sentCount = 0;
    this.receivedCount = 0;

    this.successfulConnectsCount = 0;
  }

  send(data) {
    send({ data, connector: this });
    this.sentCount += 1;
  }

  signal(signal, data) {
    this.send({ signal, data });
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

      this.successfulConnectsCount += 1;

      const num = this.successfulConnectsCount;

      this.diffieHellman({
        clientPrivateKey: this.clientPrivateKey,
        clientPublicKey: this.clientPublicKey,
        lane: this.lane
      })
        .then(({ sharedSecret, sharedSecretHex }) => {
          this.ready = true;
          this.connectedAt = Date.now();

          this.emit('ready', { sharedSecret, sharedSecretHex });

          const tag = this.tag ? ` (${this.tag})` : '';

          console.log(`✓ Secure channel ready [ ${this.address}${tag} · Protocol ${this.protocol} · Negotiating lane: ${this.lane} ]`);
        })
        .catch(e => {
          if (num == this.successfulConnectsCount) {
            console.log(e);
            console.log('dropping connection and retrying again');
            this.connection.terminate();
          }
        });
    } else {
      let justDisconnected;
      if (this.connected) {
        justDisconnected = true;
      }

      if (this.connected == undefined) {
        const tag = this.tag ? ` (${this.tag})` : '';
        console.log(`Connector ${this.address}${tag} was not able to connect at first try, setting READY to false`);
      }

      this.connected = false;
      this.ready = false;
      delete this.connectedAt;

      if (justDisconnected) {
        this.emit('disconnect');
      }
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

  diffieHellman({ clientPrivateKey, clientPublicKey, lane }) {
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
            .call('finalizeHandshake', { lane })
            .then(() => {})
            .catch(e => {
              console.log(`x Lane ${this.lane} error or not available`);
              reject(e);
            });
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
