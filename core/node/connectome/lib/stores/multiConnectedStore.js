import SimpleStore from './simpleStore';

import ConnectDevice from './multiConnectedStoreModules/connectDevice';
import Foreground from './multiConnectedStoreModules/foreground';
import SwitchDevice from './multiConnectedStoreModules/switchDevice';

import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

class MultiConnectedStore extends SimpleStore {
  constructor({ address, port, protocol, protocolLane, connectToDeviceKey, logStore, rpcRequestTimeout, verbose }) {
    super();

    if (!address) {
      throw new Error('MultiConnectedStore: missing address');
    }

    const thisDeviceStateKeys = ['time', 'environment', 'nearbyDevices', 'notifications'];

    const keys = nacl.box.keyPair();
    this.publicKey = keys.publicKey;
    this.privateKey = keys.secretKey;

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
