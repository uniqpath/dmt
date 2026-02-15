import Emitter from '../../../../utils/emitter/index.js';

export default class SwitchDevice extends Emitter {
  constructor({ mcs, connectDevice, foreground }) {
    super();

    this.mcs = mcs;
    this.connectDevice = connectDevice;
    this.foreground = foreground;
  }

  switchState({ deviceKey, deviceName }) {
    this.mcs.setMerge({ activeDeviceKey: deviceKey });
    const { state, connected } = this.mcs.connectors[deviceKey];
    this.foreground.set(state.get(), { optimisticDeviceName: deviceName });
    this.mcs.connected.set(connected.get());
  }

  switch({ host, deviceKey, deviceName }) {
    if (this.mcs.connectors[deviceKey]) {
      this.switchState({ deviceKey, deviceName });
    } else if (host) {
      this.foreground.clear();
      this.mcs.setMerge({ activeDeviceKey: deviceKey, optimisticDeviceName: deviceName });

      this.connectDevice.connectOtherDevice({ host, deviceKey });
    } else {
      const localDeviceState = this.mcs.localConnector.state.get();
      const { nearbyDevices } = localDeviceState;

      const matchingDevice = nearbyDevices.find(device => device.deviceKey == deviceKey && !device.thisDevice);

      if (matchingDevice) {
        const { deviceKey, deviceName, ip: host } = matchingDevice;
        this.switch({ host, deviceKey, deviceName });
      } else {
        this.emit('connect_to_device_key_failed');
        this.switchState(localDeviceState.device);
      }
    }
  }
}
