const fs = require('fs');
const path = require('path');

const dmtUserDir = require('dmt-bridge').userDir;
const devicesFile = path.join(dmtUserDir, 'devices/devices.json');
const deviceRegistry = fs.existsSync(devicesFile) ? require(devicesFile) : [];

module.exports = {
  findByMac(devices, mac) {
    return devices.find(device => device.mac == mac);
  },

  identify(scanResults) {
    return scanResults.map(device => {
      const knownDevice = this.findByMac(deviceRegistry, device.mac);

      return knownDevice ? Object.assign(device, knownDevice) : device;
    });
  }
};
