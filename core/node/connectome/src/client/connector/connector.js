import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send.js';
import receive from './receive.js';

import WritableStore from '../../stores/lib/helperStores/writableStore.js';
import logger from '../../utils/logger/logger.js';

import { EventEmitter, listify, hexToBuffer, bufferToHex } from '../../utils/index.js';

import RpcClient from '../rpc/client.js';
import RPCTarget from '../rpc/RPCTarget.js';

import { newKeypair, acceptKeypair } from '../../utils/crypto/index.js';

import ProtocolState from './protocolState';
import ConnectionState from './connectionState';

class Connector extends EventEmitter {
  constructor({ endpoint, protocol, keypair = newKeypair(), rpcRequestTimeout, verbose = false, tag, log = console.log, dummy } = {}) {
    super();

    this.protocol = protocol;
    this.log = log;

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

    if (verbose) {
      logger.cyan(this.log, `Connector ${this.remoteAddress()} instantiated`);
    }
  }

  send(data) {
    send({ data, connector: this });
    this.sentCount += 1;
  }

  signal(signal, data) {
    if (this.connected.get()) {
      this.send({ signal, data });
    } else {
      logger.write(this.log, 'Warning: trying to send signal over disconnected connector, this should be prevented by GUI');
    }
  }

  on(eventName, handler) {
    if (eventName == 'ready') {
      if (this.isReady()) {
        handler();
      }
    }

    super.on(eventName, handler);
  }

  getSharedSecret() {
    return this.sharedSecret ? bufferToHex(this.sharedSecret) : undefined;
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

      if (this.verbose) {
        logger.write(this.log, `✓ Connector ${this.remoteAddress()} websocket connected`);
      }

      this.diffieHellman({
        clientPrivateKey: this.clientPrivateKey,
        clientPublicKey: this.clientPublicKey,
        protocol: this.protocol
      })
        .then(() => {
          this.connectedAt = Date.now();
          this.connected.set(true);

          this.ready = true;

          this.emit('ready');
        })
        .catch(e => {
          if (num == this.successfulConnectsCount) {
            logger.write(this.log, e);
            logger.write(this.log, 'dropping connection and retrying');
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
        logger.write(this.log, `Connector ${this.endpoint}${tag} was not able to connect at first try, setting READY to false`);
      }

      this.transportConnected = false;
      this.ready = false;
      this.sharedSecret = undefined;

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

          this.sharedSecret = sharedSecret;

          this._remotePubkeyHex = remotePubkeyHex;

          if (this.verbose) {
            logger.write(this.log, `Connector ${this.endpoint}: Established shared secret through diffie-hellman exchange.`);
          }

          this.remoteObject('Auth')
            .call('finalizeHandshake', { protocol })
            .then(res => {
              if (res && res.error) {
                logger.write(this.log, `x Protocol ${this.protocol} error:`);
                logger.write(this.log, res.error);
              } else {
                success();

                const tag = this.tag ? ` (${this.tag})` : '';
                logger.cyan(this.log, `✓ Protocol [ ${this.protocol || '"no-name"'} ] connection [ ${this.endpoint}${tag} ] ready`);
              }
            })
            .catch(e => {
              logger.write(this.log, `x Protocol ${this.protocol} finalizeHandshake error:`);
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
