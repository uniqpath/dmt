import fs from 'fs';

import path from 'path';
import { isMainDevice, isMainServer } from 'dmt/common';

function extractDeviceNames(input) {
  const regex = /\(([^)]+)\)/g;
  const match = regex.exec(input);

  if (match) {
    return match[1].split(',').map(d => d.trim());
  }

  return [];
}

export default function init(program, userEnginePath) {
  let dir;

  dir = path.join(userEnginePath, '_devices');

  program.loadDirectory(dir, m => {
    const devices = extractDeviceNames(m);
    return devices.includes(program.device.id) || (isMainDevice() && devices.includes('mainDevice')) || (isMainServer() && devices.includes('mainServer'));
  });

  dir = path.join(userEnginePath, '_devices/mainDevice');

  if (fs.existsSync(dir)) {
    program.loadDirectoryRecursive(dir, m => {
      const devices = extractDeviceNames(m);
      return isMainDevice() || devices.includes(program.device.id) || (isMainServer() && devices.includes('mainServer'));
    });
  }

  dir = path.join(userEnginePath, '_devices/mainServer');

  if (fs.existsSync(dir)) {
    program.loadDirectoryRecursive(dir, m => {
      const devices = extractDeviceNames(m);
      return isMainServer() || devices.includes(program.device.id) || (isMainDevice() && devices.includes('mainDevice'));
    });
  }
}
