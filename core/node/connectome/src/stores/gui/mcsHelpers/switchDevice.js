import Emitter from '../../../utils/emitter/index.js';

class SwitchDevice extends Emitter {
  constructor({ mcs, connectDevice, foreground }) {
    super();

    this.mcs = mcs;
    this.connectDevice = connectDevice;
    this.foreground = foreground;
  }

  switchState({ deviceKey, deviceName }) {
    this.mcs.setMerge({ activeDeviceKey: deviceKey });
    const { state } = this.mcs.stores[deviceKey];
    this.foreground.set(state, { optimisticDeviceName: deviceName });
  }

  switch({ address, deviceKey, deviceName }) {
    if (this.mcs.stores[deviceKey]) {
      this.switchState({ deviceKey, deviceName });
    } else if (address) {
      this.foreground.clear();
      this.mcs.setMerge({ activeDeviceKey: deviceKey, optimisticDeviceName: deviceName });

      this.connectDevice.connectOtherDevice({ address, deviceKey });
    } else {
      const { nearbyDevices } = this.mcs.localDeviceStore.get();

      const matchingDevice = nearbyDevices.find(device => device.deviceKey == deviceKey && !device.thisDevice);

      if (matchingDevice) {
        const { deviceKey, deviceName, ip: address } = matchingDevice;
        this.switch({ address, deviceKey, deviceName });
      } else {
        this.emit('connect_to_device_key_failed');

        const thisDevice = nearbyDevices.find(device => device.thisDevice);
        this.switchState(thisDevice);
      }
    }
  }
}

export default SwitchDevice;
