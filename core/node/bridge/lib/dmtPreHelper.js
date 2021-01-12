import fs from 'fs';
import os from 'os';
import path from 'path';
import def from './parsers/def/parser';
import colors from 'colors';
import scan from './scan';

const { homedir } = os;

const dmtPath = path.join(homedir(), '.dmt');
const dmtUserDir = path.join(dmtPath, 'user');
const stateDir = path.join(dmtPath, 'state');

const devicesFull = [];
const devicesBasic = [];

function getAllFuncs(obj) {
  return Object.getOwnPropertyNames(obj.prototype).filter(prop => prop != 'constructor' && typeof obj.prototype[prop] == 'function');
}

function includeModule(obj, Module) {
  const module = new Module();
  for (const func of getAllFuncs(Module)) {
    obj[func] = module[func].bind(obj);
  }
}

function deviceDefFile(deviceName = 'this', file = 'device') {
  return path.join(dmtUserDir, `devices/${deviceName}/def/${file}.def`);
}

function readDeviceDef({ filePath, onlyBasicParsing, caching = true }) {
  const deviceDef = def.parseFile(filePath, { onlyBasicParsing, caching });

  return def.makeTryable(deviceDef.multi.length > 0 ? deviceDef.device : { empty: true });
}

function isDevMachine() {
  return fs.existsSync(path.join(dmtUserDir, 'devices/this/.dev-machine'));
}

function isDevCluster() {
  return isDevMachine() || fs.existsSync(path.join(dmtUserDir, 'devices/this/.dev-cluster'));
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

  const list = scan.dir(path.join(dmtUserDir, 'devices'), { onlyDirs: true });

  for (const deviceDir of list) {
    const deviceDefFile = path.join(deviceDir, 'def/device.def');
    if (fs.existsSync(deviceDefFile)) {
      const def = readDeviceDef({ filePath: deviceDefFile, onlyBasicParsing, caching });

      if (onlyBasicParsing) {
        devicesBasic.push(def);
      } else {
        devicesFull.push(def);
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

export { dmtPath, dmtUserDir, stateDir, device, devices, includeModule, deviceDefFile, isDevMachine, isDevCluster, debugMode, debugCategory };
