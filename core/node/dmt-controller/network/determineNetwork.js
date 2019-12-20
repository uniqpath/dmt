const colors = require('colors');

const dmt = require('dmt-bridge');
const { log } = dmt;

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
  }

  determineCurrentNetwork(nearbyDevices) {
    if (this.program.apMode()) {
      this.obj.def = null;
    } else if (dmt.definedNetworkId()) {
      this.obj.def = dmt.networkDef(dmt.definedNetworkId());
    } else if (nearbyDevices) {
      this.dynamicallyDetermineCurrentNetwork(nearbyDevices);
    }
  }

  dynamicallyDetermineCurrentNetwork(nearbyDevices) {
    let networkId;
    let savedDeviceId;

    let inconsistent = false;

    for (const deviceId of Object.keys(nearbyDevices)) {
      const device = nearbyDevices[deviceId];

      if (device.networkId) {
        if (networkId) {
          if (networkId != device.networkId) {
            inconsistent = true;
            log.red(
              `Inconsistent special node network ids: ${colors.cyan(networkId)} (${colors.magenta(savedDeviceId)}) vs ${colors.cyan(
                device.networkId
              )} (${colors.magenta(device.deviceId)})`
            );
          }
        } else {
          networkId = device.networkId;
          savedDeviceId = device.deviceId;
        }
      }
    }

    if (networkId && !inconsistent) {
      this.obj.def = dmt.networkDef(networkId);
    }

    if (inconsistent) {
      delete this.obj.def;
    }
  }
}

module.exports = DetermineNetwork;
