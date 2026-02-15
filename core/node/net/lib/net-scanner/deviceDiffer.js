import fs from 'fs';
import path from 'path';
import { findByMac } from './deviceIdentifier.js';

export default function deviceDiffer(stateDir, devices) {
  const lastScanPath = path.join(stateDir, 'lastScan.json');

  const lastScan = fs.existsSync(lastScanPath) ? JSON.parse(fs.readFileSync(lastScanPath)) : [];

  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir);
  }

  fs.writeFileSync(lastScanPath, JSON.stringify(devices), 'utf8');

  const missingDevices = lastScan.filter(device => !findByMac(devices, device.mac));

  return devices
    .map(device => (findByMac(lastScan, device.mac) ? device : Object.assign(device, { new: true })))
    .concat(missingDevices.map(device => Object.assign(device, { missing: true })));
}
