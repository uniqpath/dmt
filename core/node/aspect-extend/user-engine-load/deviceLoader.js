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

function isNonLoadablePath(filePath) {
  const NOT_LOADABLE_DIRS = ['lib', 'helpers'];

  const dirName = path.dirname(filePath);

  const basedir = dirName.split(path.sep).pop();

  return NOT_LOADABLE_DIRS.includes(basedir);
}

export default function init(program, userEnginePath) {
  let dir;

  dir = path.join(userEnginePath, '_devices');

  program.loadDirectory(dir, m => {
    const devices = extractDeviceNames(m);
    return (
      !isNonLoadablePath(m) &&
      (devices.includes(program.device.id) || (isMainDevice() && devices.includes('mainDevice')) || (isMainServer() && devices.includes('mainServer')))
    );
  });

  dir = path.join(userEnginePath, '_devices/mainDevice');

  if (fs.existsSync(dir)) {
    program.loadDirectoryRecursive(dir, m => {
      const devices = extractDeviceNames(m);
      return !isNonLoadablePath(m) && (isMainDevice() || devices.includes(program.device.id) || (isMainServer() && devices.includes('mainServer')));
    });
  }

  dir = path.join(userEnginePath, '_devices/mainServer');

  if (fs.existsSync(dir)) {
    program.loadDirectoryRecursive(dir, m => {
      const devices = extractDeviceNames(m);
      return !isNonLoadablePath(m) && (isMainServer() || devices.includes(program.device.id) || (isMainDevice() && devices.includes('mainDevice')));
    });
  }
}
