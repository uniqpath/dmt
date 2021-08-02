import fs from 'fs';
import os from 'os';
import path from 'path';
import def from './parsers/def/parser';
import colors from 'colors';
import scan from './scan';

const DEF_EXTENSION = '.def';

const { homedir } = os;

const dmtPath = path.join(homedir(), '.dmt');
const dmtUserDir = path.join(dmtPath, 'user');
const stateDir = path.join(dmtPath, 'state');

const defDir = path.join(dmtUserDir, 'def');

const devicesFull = [];
const devicesBasic = [];

function user() {
  const _userDef = userDef();
  if (_userDef.user) {
    return def.makeTryable(_userDef.user);
  }
  return def.makeTryable({ empty: true });
}

function userDef(fileName = 'user', { onlyBasicParsing = false } = {}) {
  if (path.extname(fileName) != DEF_EXTENSION) {
    fileName = `${fileName}${DEF_EXTENSION}`;
  }

  const filePath = path.join(defDir, fileName);
  if (fs.existsSync(filePath)) {
    return def.parseFile(filePath, { onlyBasicParsing });
  }

  return def.makeTryable({ empty: true });
}

function deviceDefFile(deviceName = 'this', file = 'device') {
  return path.join(dmtUserDir, `devices/${deviceName}/def/${file}.def`);
}

function readDeviceDef({ filePath, onlyBasicParsing, caching = true }) {
  const deviceDef = def.parseFile(filePath, { onlyBasicParsing, caching });

  return def.makeTryable(deviceDef.multi.length > 0 ? deviceDef.device : { empty: true });
}

function isDevMachine() {
  return fs.existsSync(`${homedir()}/.dmt/.prevent_dmt_next`);
}

function isDevCluster() {
  return isDevMachine() || user().dev == 'true';
}

function device({ deviceName = 'this', onlyBasicParsing = false, caching = true } = {}) {
  const defMissingMsg = `⚠️  Cannot read ${colors.cyan('device.def')} file for ${colors.cyan(deviceName)} device`;

  if (deviceName == 'this') {
    const filePath = deviceDefFile(deviceName);
    return readDeviceDef({ filePath, onlyBasicParsing, caching });
  }

  const list = devices({ onlyBasicParsing, caching });

  const match = list.find(device => device.id == deviceName);

  if (!match) {
    console.log(colors.red(defMissingMsg));
    process.exit();
  }

  return match;
}

function devices({ onlyBasicParsing = false, caching = true } = {}) {
  if (onlyBasicParsing && devicesBasic.length > 0) {
    return devicesBasic;
  }

  if (!onlyBasicParsing && devicesFull.length > 0) {
    return devicesFull;
  }

  const devicesDir = path.join(dmtUserDir, 'devices');

  const list = scan.dir(devicesDir, { onlyDirs: true });

  const thisSymlink = path.join(devicesDir, 'this');

  let thisDeviceDir;

  if (fs.existsSync(thisSymlink)) {
    thisDeviceDir = fs.readlinkSync(thisSymlink);
  }

  for (const deviceDir of list) {
    let _coredata;

    if (!onlyBasicParsing) {
      _coredata = { deviceDir: path.basename(deviceDir) };

      if (_coredata.deviceDir == thisDeviceDir) {
        Object.assign(_coredata, { thisDevice: true });
      }
    }

    const deviceDefFile = path.join(deviceDir, 'def/device.def');
    if (fs.existsSync(deviceDefFile)) {
      const def = readDeviceDef({ filePath: deviceDefFile, onlyBasicParsing, caching });

      if (onlyBasicParsing) {
        devicesBasic.push(def);
      } else {
        Object.assign(_coredata, { deviceName: def.id });

        if (def.try('main') == 'true') {
          Object.assign(_coredata, { mainDevice: true });
        }

        devicesFull.push({ ...def, _coredata });
      }
    }
  }

  return onlyBasicParsing ? devicesBasic : devicesFull;
}

function debugMode(category = null) {
  const debugInfoFile = path.join(stateDir, '.debug-mode');

  if (fs.existsSync(debugInfoFile)) {
    if (category) {
      return debugCategory(category);
    }

    return true;
  }
}

function debugCategory(category = null) {
  if (category) {
    const debugInfoFile = path.join(stateDir, '.debug-mode');

    const categoriesDebugModeFile = !fs.existsSync(debugInfoFile)
      ? []
      : scan
          .readFileLines(debugInfoFile)
          .map(line => line.trim())
          .filter(line => line != '' && !line.startsWith('#'));

    const categoriesDeviceDef = def.values(device().try('debug.log'));

    const categories = categoriesDebugModeFile.concat(categoriesDeviceDef);

    if (categoriesDeviceDef.find(cat => cat == category)) {
      console.log(
        `⚠️  Warning: debug category ${colors.yellow(category)} is defined in ${colors.cyan('device.def')}, ${colors.red('not the best permanent practice')}.`
      );
    }

    return categories.find(cat => cat == category);
  }
}

export { dmtPath, dmtUserDir, stateDir, user, userDef, device, devices, deviceDefFile, isDevMachine, isDevCluster, debugMode, debugCategory };
