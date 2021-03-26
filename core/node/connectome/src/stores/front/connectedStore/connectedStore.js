import fastJsonPatch from 'fast-json-patch';

import WritableStore from '../helperStores/writableStore.js';
import connect from '../../../client/connect/connectBrowser.js';
import { newKeypair, acceptKeypair } from '../../../utils/crypto/index.js';

const { applyPatch: applyJSONPatch } = fastJsonPatch;

class ConnectedStore extends WritableStore {
  constructor({ endpoint, address, port, protocol, lane, keypair = newKeypair(), logStore, rpcRequestTimeout, verbose } = {}) {
    super({});

    this.protocol = protocol;
    this.lane = lane;

    this.logStore = logStore;
    this.verbose = verbose;

    this.rpcRequestTimeout = rpcRequestTimeout;

    this.connected = new WritableStore();

    this.connect(endpoint, address, port, acceptKeypair(keypair));
  }

  signal(signal, data) {
    if (this.connector.connected) {
      console.log(`Sending signal '${signal}' over connector ${this.connector.address}`);
      this.connector.signal(signal, data);
    } else {
      console.log(
        'Warning: trying to send signal over disconnected connector, this should be prevented by GUI (to disable any backend state-change when disconnected)'
      );
    }
  }

  remoteObject(handle) {
    return this.connector.remoteObject(handle);
  }

  connect(endpoint, address, port, keypair) {
    this.connector = connect({
      endpoint,
      address,
      port,
      protocol: this.protocol,
      lane: this.lane,
      keypair,
      rpcRequestTimeout: this.rpcRequestTimeout,
      verbose: this.verbose
    });

    this.connector.on('ready', ({ sharedSecret, sharedSecretHex }) => {
      this.connected.set(true);
      this.emit('ready');
    });

    // 💡 connected == undefined ==> while trying to connect
    // 💡 connected == false => while disconnected
    // 💡 connected == true => while connected
    setTimeout(() => {
      if (this.connected.get() == undefined) {
        this.connected.set(false);
      }
    }, 300);

    this.connector.on('disconnect', () => {
      this.connected.set(false);
    });

    // 💡 Special incoming JSON message: { state: ... } ... parsed as part of 'Connectome State Syncing Protocol'
    this.connector.on('receive_state', state => {
      this.wireStateReceived = true;

      if (this.verbose) {
        console.log(`New store ${address} / ${this.protocol} / ${this.lane} state:`);
        console.log(state);
      }

      this.set(state);
    });

    // 💡 Special incoming JSON message: { diff: ... } ... parsed as part of 'Connectome State Syncing Protocol'
    this.connector.on('receive_diff', diff => {
      if (this.wireStateReceived) {
        applyJSONPatch(this.state, diff);
        this.announceStateChange();
      }
    });
  }
}

export default ConnectedStore;
