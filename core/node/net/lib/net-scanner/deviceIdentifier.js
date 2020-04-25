import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';

const dmtUserDir = dmt.userDir;
const devicesFile = path.join(dmtUserDir, 'devices/devices.json');
const deviceRegistry = fs.existsSync(devicesFile) ? JSON.parse(fs.readFileSync(devicesFile)) : [];

function findByMac(devices, mac) {
  return devices.find(device => device.mac == mac);
}

function identify(scanResults) {
  return scanResults.map(device => {
    const knownDevice = findByMac(deviceRegistry, device.mac);

    return knownDevice ? Object.assign(device, knownDevice) : device;
  });
}

export { findByMac, identify };
