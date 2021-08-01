import dmt from 'dmt/common';

const { identifyDeviceByMac } = dmt;

function findByMac(devices, mac) {
  return devices.find(device => device.mac == mac);
}

function identify(scanResults) {
  return scanResults.map(device => {
    const knownDevice = identifyDeviceByMac(device.mac);
    return knownDevice ? Object.assign(device, knownDevice) : device;
  });
}

export { findByMac, identify };
