import path from 'path';

import { isMainDevice, isMainServer, scan, log, program } from 'dmt/common';

function extractDeviceNames(input) {
  const regex = /\(([^)]+)\)/g;
  const match = regex.exec(input);

  if (match) {
    return match[1].split(',').map(d => d.trim().toLowerCase());
  }

  return [];
}

function thisDeviceIsInTheList(devices) {
  return devices.map(d => d.toLowerCase()).includes(program.device.id.toLowerCase());
}

function loadDir(dir, checkFunction) {
  program.loadDirectoryRecursive(dir, m => {
    const devices = extractDeviceNames(m);

    return (
      checkFunction() ||
      thisDeviceIsInTheList(devices) ||
      (isMainDevice() && devices.includes('mainDevice'.toLowerCase())) ||
      (isMainServer() && devices.includes('mainServer'.toLowerCase()))
    );
  });
}

export default function init(program, userEnginePath) {
  const baseDir = path.join(userEnginePath, '_devices');

  scan.dir(baseDir, { onlyDirs: true }).forEach(dirPath => {
    const devicesInDirname = path
      .basename(dirPath)
      .replace(/[-[(].*$/, '')
      .toLowerCase()
      .split(',')
      .map(d => d.trim());

    loadDir(
      dirPath,
      () =>
        devicesInDirname.includes(program.device.id.toLowerCase()) ||
        (isMainDevice() && devicesInDirname.includes('mainDevice'.toLowerCase())) ||
        (isMainServer() && devicesInDirname.includes('mainServer'.toLowerCase()))
    );
  });

  program.loadDirectory(baseDir, m => {
    const devicesInFilename = extractDeviceNames(m);

    return (
      thisDeviceIsInTheList(devicesInFilename) ||
      (isMainDevice() && devicesInFilename.includes('mainDevice'.toLowerCase())) ||
      (isMainServer() && devicesInFilename.includes('mainServer'.toLowerCase()))
    );
  });
}
