import path from 'path';

import { isMainDevice, isMainServer, scan, log, program, devices, dmtUserDir, colors } from 'dmt/common';

const userEnginePath = path.join(dmtUserDir, 'engine');

const DEVICES_DIR = path.join(userEnginePath, '_devices');

function extractDeviceNames(input) {
  const regex = /\(([^)]+)\)/g;
  const match = regex.exec(input);

  if (match) {
    return match[1].split(',').map(d => d.trim().toLowerCase());
  }

  return [];
}

function thisDeviceIsInTheList(devices) {
  return devices.map(d => d.toLowerCase()).includes(program.device.deviceName.toLowerCase());
}

function printLine(filePath) {
  log.cyan(`🤖 Loading device code ${colors.magenta(path.relative(DEVICES_DIR, filePath))}`);
}

function loadDir(dir, checkFunction) {
  program.loadDirectoryRecursive(
    dir,
    m => {
      const devices = extractDeviceNames(m);

      return (
        checkFunction() ||
        thisDeviceIsInTheList(devices) ||
        (isMainDevice() && devices.includes('mainDevice'.toLowerCase())) ||
        (isMainServer() && devices.includes('mainServer'.toLowerCase()))
      );
    },
    { debug: printLine }
  );
}

function deviceNamespace(deviceId) {
  const parts = deviceId.split('/');

  if (parts.length <= 1) return;

  parts.pop();
  return parts.join('/');
}

function getNamespaces() {
  const namespaces = devices()
    .map(d => deviceNamespace(d.id))
    .filter(n => n);
  return [...new Set(namespaces)];
}

function load(dir, currentNamespace = null) {
  const thisDeviceNamespace = deviceNamespace(program.device.id)?.toLowerCase();

  scan.dir(dir, { onlyDirs: true }).forEach(dirPath => {
    const dirname = path
      .basename(dirPath)
      .replace(/[-[(].*$/, '')
      .toLowerCase();

    if (
      getNamespaces()
        .map(n => n.toLowerCase())
        .includes(path.relative(DEVICES_DIR, dirPath))
    ) {
      const newNamespace = currentNamespace ? `${currentNamespace}/${dirname}` : dirname;
      load(dirPath, newNamespace);
      return;
    }

    const devicesInDirname = dirname.split(',').map(d => d.trim());

    loadDir(
      dirPath,
      () =>
        (thisDeviceNamespace == currentNamespace && devicesInDirname.includes(program.device.deviceName.toLowerCase())) ||
        (isMainDevice() && devicesInDirname.includes('mainDevice'.toLowerCase())) ||
        (isMainServer() && devicesInDirname.includes('mainServer'.toLowerCase()))
    );
  });

  program.loadDirectory(
    dir,
    m => {
      const devicesInFilename = extractDeviceNames(m);

      return (
        (thisDeviceNamespace == currentNamespace && thisDeviceIsInTheList(devicesInFilename)) ||
        (isMainDevice() && devicesInFilename.includes('mainDevice'.toLowerCase())) ||
        (isMainServer() && devicesInFilename.includes('mainServer'.toLowerCase()))
      );
    },
    { debug: printLine }
  );
}

export default function init(program, userEnginePath) {
  load(DEVICES_DIR);
}
