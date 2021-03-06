import colors from 'colors';

import dmt from 'dmt/common';
const { log, def, loop } = dmt;

import determineNetworkSegment from './determineNetworkSegment';

class DetermineNetwork {
  constructor({ program, obj }) {
    this.program = program;
    this.obj = obj;

    this.determineCurrentNetworkAndSegment();

    program.on('nearby_devices', nearbyDevices => {
      if (!obj.def) {
        this.determineCurrentNetworkAndSegment(nearbyDevices);
      }
    });

    loop(this.determineCurrentNetworkAndSegment.bind(this), 10000);
  }

  determineCurrentNetworkAndSegment(nearbyDevices) {
    if (this.program.apMode()) {
      this.obj.def = null;
    } else if (dmt.definedNetworkId()) {
      this.obj.def = dmt.networkDef(dmt.definedNetworkId());
    } else if (nearbyDevices) {
      this.dynamicallyDetermineCurrentNetwork(nearbyDevices);
    }

    this.determineSegment();
  }

  determineSegment() {
    let networkId;

    const { def: networkDef } = this.obj;

    if (networkDef) {
      networkId = def.id(networkDef);
    }

    determineNetworkSegment({ program: this.program, networkId });
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
              `Inconsistent special node network ids: ${colors.cyan(networkId)} (${colors.magenta(savedDeviceName)}) vs ${colors.cyan(
                device.networkId
              )} (${colors.magenta(device.deviceName)})`
            );
          }
        } else {
          networkId = device.networkId;
          savedDeviceName = device.deviceName;
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

export default DetermineNetwork;
