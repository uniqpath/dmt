import fastJsonPatch from 'fast-json-patch';

import { connectBrowser as connect } from 'connectome';
import SimpleStore from './simpleStore';

const { applyPatch: applyJSONPatch } = fastJsonPatch;

class ConnectedStore extends SimpleStore {
  constructor({ ip = null, ssl = false, port, protocol, protocolLane, session, logStore, rpcRequestTimeout, rpcObjectsSetup, verbose } = {}) {
    super();

    this.ssl = ssl;
    this.protocol = protocol;
    this.protocolLane = protocolLane;
    this.session = session;
    this.logStore = logStore;
    this.verbose = verbose;

    this.set({ ip: ip || window.location.hostname });

    this.rpcRequestTimeout = rpcRequestTimeout;

    const objects = rpcObjectsSetup ? rpcObjectsSetup({ store: this }) : {};

    this.connect(this.ip, port, objects);
  }

  remoteObject(handle) {
    return this.connector.remoteObject(handle);
  }

  connect(address, port, objects) {
    const clientPrivateKey = this.session.privateKey;
    const clientPublicKey = this.session.publicKey;

    connect({
      address,
      ssl: this.ssl,
      port,
      protocol: this.protocol,
      protocolLane: this.protocolLane,
      clientPrivateKey,
      clientPublicKey,
      rpcRequestTimeout: this.rpcRequestTimeout,
      verbose: this.verbose
    }).then(connector => {
      this.connector = connector;

      for (const [handle, obj] of Object.entries(objects)) {
        connector.registerRemoteObject(handle, obj);
      }

      connector.on('wire_receive', ({ jsonData }) => {
        if (jsonData.state) {
          this.wireStateReceived = true;

          if (this.verbose) {
            console.log(`New store ${this.ip} / ${this.protocol} / ${this.protocolLane} state:`);
            console.log(jsonData.state);
          }

          this.set(jsonData.state);
        }

        if (jsonData.diff && this.wireStateReceived) {
          applyJSONPatch(this.state, jsonData.diff);
          this.pushStateToSubscribers();
        }
      });

      connector.on('ready', ({ sharedSecret, sharedSecretHex }) => {
        if (!this.connected) {
          this.emit('connected');
        }

        this.set({ connected: true });

        this.session.set({ sharedSecret, sharedSecretHex });
      });

      connector.on('disconnected', () => {
        this.set({ connected: false });
      });
    });
  }
}

export default ConnectedStore;
