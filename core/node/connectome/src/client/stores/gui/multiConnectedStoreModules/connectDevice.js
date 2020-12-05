import ConnectedStore from '../connectedStore.js';

class ConnectDevice {
  constructor({ mcs, foreground, connectToDeviceKey }) {
    this.mcs = mcs;
    this.foreground = foreground;
    this.connectToDeviceKey = connectToDeviceKey;
  }

  createStore({ address }) {
    const { port, protocol, lane, logStore, rpcRequestTimeout, verbose, privateKey: clientPrivateKey, publicKey: clientPublicKey } = this.mcs;

    return new ConnectedStore({
      address,
      port,
      protocol,
      lane,
      clientPrivateKey,
      clientPublicKey,
      logStore,
      rpcRequestTimeout,
      verbose
    });
  }

  getDeviceKey(state) {
    const { device } = state;

    if (device && device.deviceKey) {
      const { deviceKey } = device;
      return deviceKey;
    }
  }

  connectThisDevice({ address }) {
    const thisStore = this.createStore({ address });

    thisStore.subscribe(state => {
      if (!state.nearbyDevices) {
        state.nearbyDevices = [];
      }

      const deviceKey = this.getDeviceKey(state);

      if (deviceKey) {
        if (!this.thisDeviceAlreadySetup) {
          this.mcs.stores[deviceKey] = thisStore;
          this.mcs.set({ activeDeviceKey: deviceKey });
        }

        const needToConnectAnotherDevice = this.connectToDeviceKey && this.connectToDeviceKey != deviceKey;

        if (this.mcs.activeDeviceKey == deviceKey && !needToConnectAnotherDevice) {
          const optimisticDeviceName = state.device.deviceName;
          this.foreground.set(state, { optimisticDeviceName });
        }

        this.foreground.setSpecial(state);

        if (!this.thisDeviceAlreadySetup) {
          if (needToConnectAnotherDevice) {
            this.mcs.switch({ deviceKey: this.connectToDeviceKey });
            delete this.connectToDeviceKey;
          }

          this.thisDeviceAlreadySetup = true;
        }
      }
    });

    return thisStore;
  }

  connectOtherDevice({ address, deviceKey }) {
    const newStore = this.createStore({ address });

    this.mcs.stores[deviceKey] = newStore;

    newStore.subscribe(state => {
      if (this.mcs.activeDeviceKey == deviceKey) {
        const optimisticDeviceName = state.device ? state.device.deviceName : null;
        this.foreground.set(state, { optimisticDeviceName });
      }
    });
  }
}

export default ConnectDevice;
