const fs = require('fs');
const path = require('path');
const deviceIdentifier = require('./deviceIdentifier');

module.exports = function deviceDiffer(stateDir, devices) {
  const lastScanPath = path.join(stateDir, 'lastScan.json');

  const lastScan = fs.existsSync(lastScanPath) ? require(lastScanPath) : [];

  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir);
  }

  fs.writeFileSync(lastScanPath, JSON.stringify(devices), 'utf8');

  const missingDevices = lastScan.filter(device => !deviceIdentifier.findByMac(devices, device.mac));

  return devices
    .map(device => (deviceIdentifier.findByMac(lastScan, device.mac) ? device : Object.assign(device, { new: true })))
    .concat(missingDevices.map(device => Object.assign(device, { missing: true })));
};
