import fastJsonPatch from 'fast-json-patch';

import connect from '../../connect/connectBrowser.js';
import ConnectedStoreBase from './helperStores/connectedStoreBase.js';

import newKeypair from '../../keypair/newKeypair.js';

const { applyPatch: applyJSONPatch } = fastJsonPatch;

class ConnectedStore extends ConnectedStoreBase {
  constructor({ address, ssl = false, port, protocol, lane, keypair = newKeypair(), logStore, rpcRequestTimeout, verbose } = {}) {
    super();

    if (!address) {
      throw new Error('ConnectedStore: missing address');
    }

    this.ssl = ssl;
    this.protocol = protocol;
    this.lane = lane;

    this.logStore = logStore;
    this.verbose = verbose;

    this.rpcRequestTimeout = rpcRequestTimeout;

    this.connect(address, port, keypair);
  }

  action({ action, namespace, payload }) {
    if (this.connector.connected) {
      console.log(`Sending action ${action} over connector ${this.connector.address}`);
      this.connector.send({ action, namespace, payload });
    } else {
      console.log(
        'Warning: trying to send action over disconnected connector, this should be prevented by GUI (to disable any state-changing element when not connected)'
      );
    }
  }

  remoteObject(handle) {
    return this.connector.remoteObject(handle);
  }

  connect(address, port, keypair) {
    this.connector = connect({
      address,
      ssl: this.ssl,
      port,
      protocol: this.protocol,
      lane: this.lane,
      keypair,
      rpcRequestTimeout: this.rpcRequestTimeout,
      verbose: this.verbose
    });

    this.connector.on('ready', ({ sharedSecret, sharedSecretHex }) => {
      this.setConnected(true);
      this.emit('ready');
    });

    // 💡 connected == undefined ==> while trying to connect
    // 💡 connected == false => while disconnected
    // 💡 connected == true => while connected
    setTimeout(() => {
      if (this.state.connected == undefined) {
        this.setConnected(false);
      }
    }, 300);

    this.connector.on('disconnect', () => {
      this.setConnected(false);
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
        this.pushStateToSubscribers();
      }
    });
  }
}

export default ConnectedStore;
