import EventEmitter from 'events';

import { log, colors, networkDef, deviceNetworkId, apMode } from 'dmt/common';

function getNetworkData(networkId) {
  const data = networkDef(networkId);

  const networkData = { network: data.id };

  if (data.latlng) {
    networkData.latlng = data.latlng;
  }

  if (data.country) {
    networkData.country = data.country;
  }

  if (data.lang) {
    networkData.lang = data.lang;
  }

  return networkData;
}

class DetermineNetwork extends EventEmitter {
  constructor(program) {
    super();

    this.program = program;

    process.nextTick(() => {
      this.determineCurrentNetwork();
    });

    program.on('nearby_devices', nearbyDevices => {
      this.determineCurrentNetwork(nearbyDevices);
    });
  }

  determineCurrentNetwork(nearbyDevices) {
    if (apMode()) {
      this.emit('remove_data');
    } else if (deviceNetworkId()) {
      this.emit('data', getNetworkData(deviceNetworkId()));
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
      this.emit('data', getNetworkData(networkId));
    }

    if (inconsistent) {
      this.emit('remove_data');
    }
  }
}

export default DetermineNetwork;
