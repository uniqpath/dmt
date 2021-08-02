import connect from '../../../../client/connect/connectBrowser.js';

export default class ConnectDevice {
  constructor({ mcs, foreground, connectToDeviceKey }) {
    this.mcs = mcs;
    this.foreground = foreground;
    this.connectToDeviceKey = connectToDeviceKey;
  }

  createConnector({ host }) {
    const { port, protocol, logStore, rpcRequestTimeout, verbose, keypair } = this.mcs;
    return connect({ host, port, protocol, keypair, rpcRequestTimeout, verbose });
  }

  getDeviceKey(state) {
    return state?.device?.deviceKey;
  }

  connectThisDevice({ host }) {
    const thisConnector = this.createConnector({ host });

    thisConnector.state.subscribe(state => {
      if (!state.nearbyDevices) {
        state.nearbyDevices = [];
      }

      const deviceKey = this.getDeviceKey(state);

      if (deviceKey) {
        if (!this.thisDeviceAlreadySetup) {
          this.mcs.set({ activeDeviceKey: deviceKey });
          this.initNewConnector({ deviceKey, connector: thisConnector });
        }

        const needToConnectAnotherDevice = this.connectToDeviceKey && this.connectToDeviceKey != deviceKey;

        if (!needToConnectAnotherDevice && this.mcs.activeDeviceKey() == deviceKey) {
          const optimisticDeviceName = state.device?.deviceName;
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

    return thisConnector;
  }

  connectOtherDevice({ host, deviceKey }) {
    const connector = this.createConnector({ host });

    this.initNewConnector({ deviceKey, connector });

    connector.state.subscribe(state => {
      if (this.mcs.activeDeviceKey() == deviceKey) {
        const optimisticDeviceName = state.device ? state.device.deviceName : null;
        this.foreground.set(state, { optimisticDeviceName });
      }
    });
  }

  initNewConnector({ deviceKey, connector }) {
    this.mcs.connectors[deviceKey] = connector;

    this.setConnectedStore({ deviceKey, connector });
  }

  setConnectedStore({ deviceKey, connector }) {
    connector.connected.subscribe(connected => {
      if (this.mcs.activeDeviceKey() == deviceKey) {
        this.mcs.connected.set(connected);
      }
    });
  }
}
