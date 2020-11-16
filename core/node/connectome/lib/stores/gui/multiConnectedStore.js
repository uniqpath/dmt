import SimpleStore from './simpleStore.js';

import ConnectDevice from './multiConnectedStoreModules/connectDevice.js';
import Foreground from './multiConnectedStoreModules/foreground.js';
import SwitchDevice from './multiConnectedStoreModules/switchDevice.js';

import newKeypair from '../../keypair/newKeypair.js';

class MultiConnectedStore extends SimpleStore {
  constructor({ address, port, protocol, protocolLane, keypair = newKeypair(), connectToDeviceKey, logStore, rpcRequestTimeout, verbose }) {
    super();

    if (!address) {
      throw new Error('MultiConnectedStore: missing address');
    }

    const thisDeviceStateKeys = ['time', 'environment', 'nearbyDevices', 'notifications'];

    this.publicKey = keypair.publicKey;
    this.privateKey = keypair.privateKey;

    this.port = port;
    this.protocol = protocol;
    this.protocolLane = protocolLane;

    this.logStore = logStore;
    this.rpcRequestTimeout = rpcRequestTimeout;
    this.verbose = verbose;

    this.stores = {};

    const foreground = new Foreground({ mcs: this, thisDeviceStateKeys });
    const connectDevice = new ConnectDevice({ mcs: this, foreground, connectToDeviceKey });

    this.switchDevice = new SwitchDevice({ mcs: this, connectDevice, foreground });
    this.switchDevice.on('connect_to_device_key_failed', () => {
      this.emit('connect_to_device_key_failed');
    });

    this.localDeviceStore = connectDevice.connectThisDevice({ address });
  }

  action({ action, namespace, payload }) {
    if (this.activeStore()) {
      this.activeStore().action({ action, namespace, payload });
    } else {
      console.log(`Error emitting remote action ${action} / ${namespace}. Debug info: activeDeviceKey=${this.activeDeviceKey}`);
    }
  }

  actionAtLocalDevice({ action, namespace, payload }) {
    this.localDeviceStore.action({ action, namespace, payload });
  }

  remoteObject(objectName) {
    if (this.activeStore()) {
      return this.activeStore().remoteObject(objectName);
    }

    console.log(`Error obtaining remote object ${objectName}. Debug info: activeDeviceKey=${this.activeDeviceKey}`);
  }

  switch({ address, deviceKey, deviceName }) {
    this.switchDevice.switch({ address, deviceKey, deviceName });
  }

  activeStore() {
    if (this.activeDeviceKey) {
      return this.stores[this.activeDeviceKey];
    }
  }
}

export default MultiConnectedStore;
