import connect from '../../../../client/connect/connectBrowser.js';

export default class ConnectDevice {
  constructor({ mcs, foreground, connectToDeviceKey }) {
    this.mcs = mcs;
    this.foreground = foreground;
    this.connectToDeviceKey = connectToDeviceKey;
  }

  createConnector({ host, autoDecommission = false }) {
    const { port, protocol, rpcRequestTimeout, log, verbose, keypair } = this.mcs;
    return connect({ host, port, protocol, keypair, rpcRequestTimeout, autoDecommission, log, verbose });
  }

  getDeviceKey(state) {
    return state?.device?.deviceKey;
  }

  connectThisDevice({ host }) {
    const thisConnector = this.createConnector({ host });

    let alreadySetupPong = false;

    thisConnector.state.subscribe(state => {
      if (!state.nearbyDevices) {
        state.nearbyDevices = [];
      }

      if (!state.notifications) {
        state.notifications = [];
      }

      const deviceKey = this.getDeviceKey(state);

      if (deviceKey) {
        if (!alreadySetupPong) {
          thisConnector.on('pong', () => {
            this.mcs.emit('pong', { deviceKey });
          });

          alreadySetupPong = true;
        }

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
    if (!this.mcs.connectors[deviceKey]) {
      const connector = this.createConnector({ host, autoDecommission: true });

      connector.on('decommission', () => {
        delete this.mcs.connectors[deviceKey];
        if (connector.__removeListeners) {
          connector.__removeListeners();
        }
      });

      const pongCallback = () => {
        this.mcs.emit('pong', { deviceKey });
      };

      connector.on('pong', pongCallback);

      this.initNewConnector({ deviceKey, connector });

      const unsubscribe = connector.state.subscribe(state => {
        if (this.mcs.activeDeviceKey() == deviceKey) {
          const optimisticDeviceName = state.device ? state.device.deviceName : null;
          this.foreground.set(state, { optimisticDeviceName });
        }
      });

      connector.__removeListeners = () => {
        connector.off('pong', pongCallback);
        unsubscribe();
      };
    }

    return this.mcs.connectors[deviceKey];
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
