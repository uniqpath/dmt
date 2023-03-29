import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

import send from './send.js';
import receive from './receive.js';
import handshake from './handshake.js';

import WritableStore from '../../stores/lib/helperStores/writableStore.js';
import logger from '../../utils/logger/logger.js';

import { EventEmitter, listify, bufferToHex } from '../../utils/index.js';

import RpcClient from '../rpc/client.js';
import RPCTarget from '../rpc/RPCTarget.js';
import errorCodes from '../rpc/mole/errorCodes.js';

import { newKeypair, acceptKeypair } from '../../utils/crypto/index.js';

import ProtocolState from './protocolState.js';
import ConnectionState from './connectionState.js';

const ADJUST_UNDEFINED_CONNECTION_STATUS_DELAY = 700;

const DECOMMISSION_INACTIVITY = 60000;
const wsOPEN = 1;

class Connector extends EventEmitter {
  constructor({
    endpoint,
    protocol,
    keypair = newKeypair(),
    rpcRequestTimeout,
    verbose = false,
    tag,
    log = console.log,
    autoDecommission = false,
    dummy
  } = {}) {
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

    this.autoDecommission = autoDecommission;

    this.sentCount = 0;
    this.receivedCount = 0;

    this.successfulConnectsCount = 0;

    if (!dummy) {
      this.state = new ProtocolState(this);
      this.connectionState = new ConnectionState(this);
    }

    this.connected = new WritableStore();

    this.delayedAdjustConnectionStatus();

    if (verbose) {
      logger.green(this.log, `Connector ${this.endpoint} created`);
    }

    this.decommissionCheckCounter = 0;

    this.lastPongReceivedAt = Date.now();

    this.on('pong', () => {
      this.lastPongReceivedAt = Date.now();
    });
  }

  delayedAdjustConnectionStatus() {
    // connected == undefined ==> while trying to connect
    // connected == false => while disconnected
    // connected == true => while connected
    setTimeout(() => {
      if (this.connected.get() == undefined) {
        this.connected.set(false);
      }
    }, ADJUST_UNDEFINED_CONNECTION_STATUS_DELAY);
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

  userAction({ action, scope, payload }) {
    this.signal('__action', { action, scope, payload });
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

  connectStatus(connected) {
    if (connected) {
      this.sentCount = 0;
      this.receivedCount = 0;

      this.transportConnected = true;

      this.successfulConnectsCount += 1;

      if (this.verbose) {
        logger.white(this.log, `✓ Connector ${this.endpoint} connected (${this.successfulConnectsCount} total reconnects)`);
      }

      const websocketId = this.connection.websocket.__id;

      const afterFirstStep = ({ sharedSecret, remotePubkeyHex }) => {
        this.sharedSecret = sharedSecret;
        this._remotePubkeyHex = remotePubkeyHex;
      };

      handshake({ connector: this, afterFirstStep })
        .then(() => {
          this.connectedAt = Date.now();
          this.connected.set(true);

          this.ready = true;
          this.emit('ready');
        })
        .catch(e => {
          if (this.connection.websocket.__id == websocketId && this.connection.websocket.readyState == wsOPEN) {
            if (e.code == errorCodes.TIMEOUT) {
              logger.write(this.log, `${this.endpoint} x Connector [ ${this.protocol} ] handshake error: "${e.message}"`);

              logger.write(this.log, `${this.endpoint} Connector dropping stale websocket after handshake error`);

              this.connection.terminate();
            }
          }

          if (e.code != errorCodes.TIMEOUT) {
            logger.write(
              this.log,
              `${this.endpoint} x Connector [ ${this.protocol} ] on:ready error: "${e.stack}" — (will not try to reconnect, fix the error and reload this gui)`
            );
          }
        });
    } else {
      let isDisconnect;

      if (this.transportConnected) {
        isDisconnect = true;
      }

      if (this.transportConnected == undefined) {
        logger.write(this.log, `${this.endpoint} Connector was not able to connect at first try`);
      }

      this.transportConnected = false;
      this.ready = false;
      this.sharedSecret = undefined;

      delete this.connectedAt;

      if (isDisconnect) {
        this.emit('disconnect');

        if (connected == undefined) {
          this.delayedAdjustConnectionStatus();
        }

        this.connected.set(connected);
      }
    }
  }

  checkForDecommission() {
    if (!this.autoDecommission) {
      return;
    }

    if (this.decommissionCheckRequestedAt && Date.now() - this.decommissionCheckRequestedAt > 3000) {
      this.decommissionCheckCounter = 0;
    }

    this.decommissionCheckRequestedAt = Date.now();

    this.decommissionCheckCounter += 1;

    if (this.decommissionCheckCounter > 12) {
      if (Date.now() - this.lastPongReceivedAt > DECOMMISSION_INACTIVITY) {
        logger.write(this.log, `Decommissioning connector ${this.endpoint} (long inactive)`);

        this.decommission();
        this.emit('decommission');
      }
    }
  }

  decommission() {
    this.decommissioned = true;
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
