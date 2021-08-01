import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send.js';
import receive from './receive.js';

import WritableStore from '../../stores/front/helperStores/writableStore.js';

import { EventEmitter, listify, hexToBuffer, bufferToHex } from '../../utils/index.js';

import RpcClient from '../rpc/client.js';
import RPCTarget from '../rpc/RPCTarget.js';

import { newKeypair, acceptKeypair } from '../../utils/crypto/index.js';

import ProtocolState from './protocolState';
import ConnectionState from './connectionState';

class Connector extends EventEmitter {
  constructor({ endpoint, protocol, keypair = newKeypair(), rpcRequestTimeout, verbose = false, tag, dummy } = {}) {
    super();

    this.protocol = protocol;

    const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = acceptKeypair(keypair);

    this.clientPrivateKey = clientPrivateKey;
    this.clientPublicKey = clientPublicKey;
    this.clientPublicKeyHex = bufferToHex(clientPublicKey);

    this.rpcClient = new RpcClient(this, rpcRequestTimeout);

    this.endpoint = endpoint;
    this.verbose = verbose;
    this.tag = tag;

    this.sentCount = 0;
    this.receivedCount = 0;

    this.successfulConnectsCount = 0;

    if (!dummy) {
      this.state = new ProtocolState(this);
      this.connectionState = new ConnectionState(this);
    }

    this.connected = new WritableStore();

    // connected == undefined ==> while trying to connect
    // connected == false => while disconnected
    // connected == true => while connected
    setTimeout(() => {
      if (this.connected.get() == undefined) {
        this.connected.set(false);
      }
    }, 700);
  }

  send(data) {
    send({ data, connector: this });
    this.sentCount += 1;
  }

  signal(signal, data) {
    if (this.connected.get()) {
      this.send({ signal, data });
    } else {
      console.log('Warning: trying to send signal over disconnected connector, this should be prevented by GUI');
    }
  }

  wireReceive({ jsonData, encryptedData, rawMessage }) {
    receive({ jsonData, encryptedData, rawMessage, connector: this });
    this.receivedCount += 1;
  }

  field(name) {
    return this.connectionState.get(name);
  }

  isReady() {
    return this.ready;
  }

  closed() {
    return !this.transportConnected;
  }

  decommission() {
    this.decommissioned = true;
  }

  connectStatus(connected) {
    if (connected) {
      this.sentCount = 0;
      this.receivedCount = 0;

      this.transportConnected = true;

      this.successfulConnectsCount += 1;

      const num = this.successfulConnectsCount;

      this.diffieHellman({
        clientPrivateKey: this.clientPrivateKey,
        clientPublicKey: this.clientPublicKey,
        protocol: this.protocol
      })
        .then(({ sharedSecret, sharedSecretHex }) => {
          this.ready = true;
          this.connectedAt = Date.now();

          this.connected.set(true);

          this.emit('ready', { sharedSecret, sharedSecretHex });
        })
        .catch(e => {
          if (num == this.successfulConnectsCount) {
            console.log(e);
            console.log('dropping connection and retrying again');
            this.connection.terminate();
          }
        });
    } else {
      let isDisconnect;

      if (this.transportConnected) {
        isDisconnect = true;
      }

      if (this.transportConnected == undefined) {
        const tag = this.tag ? ` (${this.tag})` : '';
        console.log(`Connector ${this.endpoint}${tag} was not able to connect at first try, setting READY to false`);
      }

      this.transportConnected = false;
      this.ready = false;
      delete this.connectedAt;

      if (isDisconnect) {
        this.emit('disconnect');
        this.connected.set(false);
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

  diffieHellman({ clientPrivateKey, clientPublicKey, protocol }) {
    return new Promise((success, reject) => {
      this.remoteObject('Auth')
        .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
        .then(remotePubkeyHex => {
          const sharedSecret = nacl.box.before(hexToBuffer(remotePubkeyHex), clientPrivateKey);
          const sharedSecretHex = bufferToHex(sharedSecret);
          this.sharedSecret = sharedSecret;

          this._remotePubkeyHex = remotePubkeyHex;

          if (this.verbose) {
            console.log('Established shared secret through diffie-hellman exchange:');
            console.log(sharedSecretHex);
          }

          this.remoteObject('Auth')
            .call('finalizeHandshake', { protocol })
            .then(res => {
              if (res && res.error) {
                console.log(`x Protocol ${this.protocol} error:`);
                console.log(res.error);
              } else {
                success({ sharedSecret, sharedSecretHex });

                const tag = this.tag ? ` (${this.tag})` : '';
                console.log(`✓ Protocol [ ${this.protocol || '"no-name"'} ] connection [ ${this.endpoint}${tag} ] ready`);
              }
            })
            .catch(e => {
              console.log(`x Protocol ${this.protocol} finalizeHandshake error:`);
              console.log(e);
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
    return this.endpoint;
  }
}

export default Connector;
