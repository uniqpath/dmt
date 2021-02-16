import WritableStore from '../helperStores/writableStore.js';
import MergeStore from '../helperStores/mergeStore.js';

import { newKeypair } from '../../../utils/crypto/index.js';

import ConnectDevice from './helpers/connectDevice.js';
import Foreground from './helpers/foreground.js';
import SwitchDevice from './helpers/switchDevice.js';

class MultiConnectedStore extends MergeStore {
  constructor({ endpoint, address, port, protocol, lane, keypair = newKeypair(), connectToDeviceKey, logStore, rpcRequestTimeout, verbose }) {
    super();

    const thisDeviceStateKeys = ['time', 'environment', 'nearbyDevices', 'notifications'];

    this.publicKey = keypair.publicKey;
    this.privateKey = keypair.privateKey;

    this.port = port;
    this.protocol = protocol;
    this.lane = lane;

    this.logStore = logStore;
    this.rpcRequestTimeout = rpcRequestTimeout;
    this.verbose = verbose;

    this.stores = {};

    this.connected = new WritableStore();

    const foreground = new Foreground({ mcs: this, thisDeviceStateKeys });
    const connectDevice = new ConnectDevice({ mcs: this, foreground, connectToDeviceKey });

    this.switchDevice = new SwitchDevice({ mcs: this, connectDevice, foreground });
    this.switchDevice.on('connect_to_device_key_failed', () => {
      this.emit('connect_to_device_key_failed');
    });

    this.localDeviceStore = connectDevice.connectThisDevice({ address });
  }

  signal(signal, data) {
    if (this.activeStore()) {
      this.activeStore().signal(signal, data);
    } else {
      console.log(`Error emitting remote signal ${signal} / ${data}. Debug info: activeDeviceKey=${this.activeDeviceKey()}`);
    }
  }

  signalLocalDevice(signal, data) {
    this.localDeviceStore.signal(signal, data);
  }

  remoteObject(objectName) {
    if (this.activeStore()) {
      return this.activeStore().remoteObject(objectName);
    }

    console.log(`Error obtaining remote object ${objectName}. Debug info: activeDeviceKey=${this.activeDeviceKey()}`);
  }

  switch({ address, deviceKey, deviceName }) {
    this.switchDevice.switch({ address, deviceKey, deviceName });
  }

  activeStore() {
    if (this.activeDeviceKey()) {
      return this.stores[this.activeDeviceKey()];
    }
  }

  activeDeviceKey() {
    return this.get().activeDeviceKey;
  }
}

export default MultiConnectedStore;
