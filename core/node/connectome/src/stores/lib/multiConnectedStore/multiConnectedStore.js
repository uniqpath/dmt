import WritableStore from '../helperStores/writableStore.js';
import MergeStore from '../helperStores/mergeStore.js';

import { newKeypair, acceptKeypair } from '../../../utils/crypto/index.js';

import ConnectDevice from './helpers/connectDevice.js';
import Foreground from './helpers/foreground.js';
import SwitchDevice from './helpers/switchDevice.js';

class MultiConnectedStore extends MergeStore {
  constructor({ host, port, protocol, keypair = newKeypair(), connectToDeviceKey, rpcRequestTimeout, log, verbose }) {
    super();

    const thisDeviceStateKeys = ['time', 'environment', 'nearbyDevices', 'notifications'];

    const { publicKey, privateKey } = acceptKeypair(keypair);

    this.publicKey = publicKey;
    this.privateKey = privateKey;

    this.keypair = keypair;

    this.port = port;
    this.protocol = protocol;

    this.log = log;
    this.rpcRequestTimeout = rpcRequestTimeout;
    this.verbose = verbose;

    this.connectors = {};

    this.connected = new WritableStore();

    const foreground = new Foreground({ mcs: this, thisDeviceStateKeys });
    const connectDevice = new ConnectDevice({ mcs: this, foreground, connectToDeviceKey });

    this.connectDevice = connectDevice;

    this.switchDevice = new SwitchDevice({ mcs: this, connectDevice, foreground });
    this.switchDevice.on('connect_to_device_key_failed', () => {
      this.emit('connect_to_device_key_failed');
    });

    this.localConnector = connectDevice.connectThisDevice({ host });
  }

  signal(signal, data) {
    if (this.activeConnector()) {
      this.activeConnector().signal(signal, data);
    } else {
      console.log(`MCS: Error emitting remote signal ${signal} / ${data}. Debug info: activeDeviceKey=${this.activeDeviceKey()}`);
    }
  }

  signalLocalDevice(signal, data) {
    this.localConnector.signal(signal, data);
  }

  remoteObject(objectName) {
    if (this.activeConnector()) {
      return this.activeConnector().remoteObject(objectName);
    }

    console.log(`Error obtaining remote object ${objectName}. Debug info: activeDeviceKey=${this.activeDeviceKey()}`);
  }

  preconnect({ host, deviceKey }) {
    this.connectDevice.connectOtherDevice({ host, deviceKey });
  }

  switch({ host, deviceKey, deviceName }) {
    this.switchDevice.switch({ host, deviceKey, deviceName });
  }

  activeConnector() {
    if (this.activeDeviceKey()) {
      return this.connectors[this.activeDeviceKey()];
    }
  }

  activeDeviceKey() {
    return this.get().activeDeviceKey;
  }
}

export default MultiConnectedStore;
