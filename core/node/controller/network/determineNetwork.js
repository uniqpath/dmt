import { log, loop, colors, networkDef, deviceNetworkId, apMode } from 'dmt/common';

class DetermineNetwork {
  constructor({ program, obj }) {
    this.program = program;
    this.obj = obj;

    this.determineCurrentNetwork();

    program.on('nearby_devices', nearbyDevices => {
      if (!obj.def) {
        this.determineCurrentNetwork(nearbyDevices);
      }
    });

    loop(this.determineCurrentNetwork.bind(this), 10000);
  }

  determineCurrentNetwork(nearbyDevices) {
    if (apMode()) {
      this.obj.def = null;
    } else if (deviceNetworkId()) {
      this.obj.def = networkDef(deviceNetworkId());
    } else if (nearbyDevices) {
      this.dynamicallyDetermineCurrentNetwork(nearbyDevices);
    }
  }

  dynamicallyDetermineCurrentNetwork(nearbyDevices) {
    let networkId;
    let savedDeviceName;

    let inconsistent = false;

    for (const device of nearbyDevices) {
      if (device.networkId) {
        if (networkId) {
          if (networkId != device.networkId) {
            inconsistent = true;
            log.red(
              `Inconsistent network ids: ${colors.cyan(networkId)} (${colors.magenta(savedDeviceName)}) vs ${colors.cyan(device.networkId)} (${colors.magenta(
                device.deviceName
              )})`
            );
          }
        } else {
          networkId = device.networkId;
          savedDeviceName = device.deviceName;
        }
      }
    }

    if (networkId && !inconsistent) {
      this.obj.def = networkDef(networkId);
    }

    if (inconsistent) {
      delete this.obj.def;
    }
  }
}

export default DetermineNetwork;
