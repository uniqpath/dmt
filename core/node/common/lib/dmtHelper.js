import fs from 'fs';
import path from 'path';
import os from 'os';

const { homedir } = os;
const { username } = os.userInfo();

import isRPi from './detectRPi';
import def from './parsers/def/parser';

import util from './util';

import {
  colors,
  colors2,
  dmtPath,
  dmtUserDir,
  dmtStateDir,
  user,
  userDef,
  device,
  devices,
  deviceDefFile,
  isDevMachine,
  isDevUser,
  isMainDevice,
  isLanServer,
  isDevPanel,
  debugMode,
  debugCategory,
  prettyFileSize
} from './dmtPreHelper';

const _device = device;

import Logger from './logger';
const log = new Logger();

import * as dateFns from './timeutils/dateFnsCompacted';

const { hexToBuffer } = util.hexutils;

const dmtHerePath = path.join(homedir(), '.dmt-here');
const catalogsDir = path.join(dmtUserDir, 'catalogs');

let deviceKeypair;

const globals = {
  tickerPeriod: 2,
  slowTickerFactor: 10
};
globals.slowTickerPeriod = globals.tickerPeriod * globals.slowTickerFactor;

function readConnectDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return def.makeTryable({ empty: true });
    }

    const connectDef = def.parseFile(filePath);
    return def.makeTryable(connectDef.multi.length > 0 ? connectDef.multi : { empty: true });
  } catch (e) {
    log.red(`connect.def: ${e.message}`);
    process.exit();
  }
}

function readKeysDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const keysDef = def.parseFile(filePath);

    if (keysDef.multi.length > 0) {
      return keysDef.multi.map(keyInfo => {
        const result = { ...keyInfo, ...{ privateKeyHex: keyInfo.private, publicKeyHex: keyInfo.public } };

        delete result.private;
        delete result.public;

        return result;
      });
    }
  } catch (e) {
    log.red(`keys.def: ${e.message}`);
    process.exit();
  }
}

function services(serviceId) {
  const name = 'services';
  const deviceName = 'this';

  const fileList = [];
  fileList.push(path.join(dmtPath, `def/${name}.def`));
  fileList.push(path.join(dmtUserDir, `def/${name}.def`));
  fileList.push(path.join(dmtUserDir, `devices/${deviceName}/def/${name}.def`));
  fileList.push({ filePath: path.join(dmtUserDir, `devices/${deviceName}/def/device.def`), secondLevel: true });

  const services = defMerge({ fileList, key: 'service' });

  const match = services.find(s => s.id == serviceId);
  const service = match || { empty: true };
  return serviceId ? def.makeTryable(service) : services;
}

function keys() {
  if (!deviceKeypair) {
    const filePath = deviceDefFile('this', 'keys');
    deviceKeypair = readKeysDef({ filePath });
  }

  return deviceKeypair;
}

function keypair() {
  const _keys = keys();

  if (_keys) {
    const keypair = util.listify(_keys).find(keypair => !keypair.id);
    if (keypair) {
      return { ...keypair, ...{ privateKey: hexToBuffer(keypair.privateKeyHex), publicKey: hexToBuffer(keypair.publicKeyHex) } };
    }
  }
}

function dmtHereEnsure(subdir) {
  const dir = path.join(dmtHerePath, subdir);
  util.mkdirp(dir);
  return dir;
}

function networks(networkId) {
  const netDef = userDef('networks.def');

  if (netDef) {
    const networks = netDef.multi;

    if (networkId) {
      const match = networks.find(network => network.id == networkId);
      return match || { empty: true };
    }

    return networks;
  }
}

function platform() {
  const { platform } = process;

  if (platform == 'win32') {
    return 'windows';
  }

  return platform;
}

function platformWithArchitecture() {
  const _platform = platform();

  if (_platform == 'linux') {
    return `${_platform}-${process.arch}`;
  }

  return _platform;
}

function prepareDefMerge({ fileList, key }) {
  const toMerge = [];

  for (const entry of fileList) {
    let filePath = entry;
    let secondLevel;

    if (typeof entry !== 'string') {
      filePath = entry.filePath;
      secondLevel = entry.secondLevel;
    }

    if (fs.existsSync(filePath)) {
      const results = secondLevel ? def.listify(def.parseFile(filePath).multi[0][key]) : def.parseFile(filePath).multi;

      toMerge.push(...results);
    }
  }

  return toMerge;
}

function defMerge({ fileList, key }) {
  const toMerge = prepareDefMerge({ fileList, key });

  const results = [];

  for (const entry of toMerge) {
    const match = results.find(el => el.id == entry.id);

    if (match) {
      for (const k of Object.keys(entry)) {
        match[k] = entry[k];
      }
    } else {
      results.push(entry);
    }
  }

  return results;
}

function getGlobalIp({ deviceName }) {
  const match = devices().find(device => device.id == deviceName);

  if (match) {
    const globalIp = def.id(match.try('network.globalIp'));
    if (globalIp) {
      return globalIp;
    }
    return { error: `Missing globalIp definition for ${colors.magenta(deviceName)}` };
  }

  return { error: colors.gray(`DMT Resolver is not recognizing hostname ${colors.yellow(deviceName)}`) };
}

export function isValidIPv4Address(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    )
  ) {
    return true;
  }

  return false;
}

export function disconnectedIPAddress(ip) {
  return ip?.startsWith('169.254');
}

export function isMacOS() {
  return platform() == 'darwin';
}

export function isWindows() {
  return platform() == 'windows';
}

export function isLinux() {
  return platform() == 'linux';
}

export function platformDescription() {
  if (isRPi()) {
    return 'raspberry-pi';
  }

  return platformWithArchitecture();
}

export function platformExecutablePath(executable) {
  const platform = platformWithArchitecture();
  return path.join(dmtPath, `bin/${platform}/${executable}`);
}

export function parseDef(filePath, { caching = true }) {
  return def.parseFile(filePath, { caching });
}

export function userDefaults(str) {
  const defaults = def.parseFile(path.join(dmtUserDir, 'def/defaults.def')).try('defaults');
  if (str) {
    return defaults.try(str) || { empty: true };
  }
  return def.makeTryable(defaults || { empty: true });
}

export function userDeviceTypes() {
  const deviceTypes = def.parseFile(path.join(dmtUserDir, 'def/device_types.def'));
  return deviceTypes;
}

export function deviceNetworkId() {
  return def.id(device().network);
}

export function networkDef(networkId) {
  const emptyObj = { empty: true };
  const network = (networks() || []).find(network => network.id == networkId);
  return def.makeTryable(network || emptyObj);
}

export function deviceDefIsMissing(deviceName = 'this') {
  const filePath = deviceDefFile(deviceName);
  return !fs.existsSync(filePath);
}

export function deviceDir(deviceName = device().id) {
  const devicesDir = path.join(dmtUserDir, 'devices');

  return path.join(devicesDir, deviceName);
}

export function peerConnections() {
  const filePath = deviceDefFile('this', 'connect');
  const connections = readConnectDef({ filePath });
  return connections.empty ? [] : connections;
}

export function checkIfIdAlreadyPresentInList(prop, list, _id) {
  if (list.map(el => def.id(el)).includes(_id)) {
    throw new Error(`an element of key=${prop} with id=${_id} already exists, please make sure all ids for key=${prop} are unique`);
  }
}

export function determineGUIPort() {
  const isRootUser = username == 'root';

  const ports = def.listify(services('gui').port);

  const portForRootUser = ports.find(port => port.whenRootUser == 'true');

  if (isRootUser && portForRootUser) {
    return portForRootUser.id;
  }

  const normalPorts = ports.filter(port => port.whenRootUser != 'true');

  if (normalPorts.length > 0) {
    return def.id(normalPorts[0]);
  }
}

export function accessTokens(service) {
  const tokensDef = def.parseFile(path.resolve(dmtUserDir, 'access_tokens', `${service}.def`));
  return tokensDef.multi.length > 0 ? tokensDef.multi[0] : null;
}

export function absolutizePath({ path, catalog, device }) {
  if (catalog) {
    return catalog.startsWith('/') ? catalog : require('path').join(catalogsDir, `${device.id}/${catalog}`);
  }

  if (path) {
    return device.id == _device().id ? path.replace(/^~/, homedir()) : path;
  }
}

export function getIp({ deviceName }) {
  const match = devices({ onlyBasicParsing: true }).find(device => device.id == deviceName);

  if (match) {
    const ip = match.try('network.ip');
    if (ip) {
      return ip;
    }

    const globalIp = getGlobalIp({ deviceName });
    if (globalIp && !globalIp.error) {
      return globalIp;
    }

    return { error: `No ip or globalIp defined for ${colors.magenta(deviceName)}` };
  }

  return { error: colors.gray(`DMT Resolver is not recognizing hostname ${colors.yellow(deviceName)}`) };
}

export function getLocalIpViaNearby({ program, deviceName }) {
  const _deviceName = deviceName;
  const match = program
    .store('nearbyDevices')
    .get()
    .find(({ deviceName, stale }) => !stale && deviceName == _deviceName);
  if (match) {
    return match.ip;
  }
}

export {
  log,
  colors,
  colors2,
  dmtPath,
  dmtHerePath,
  dmtHereEnsure,
  dmtUserDir,
  catalogsDir,
  dmtStateDir,
  globals,
  isDevMachine,
  isDevUser,
  isMainDevice,
  isLanServer,
  isDevPanel,
  debugMode,
  debugCategory,
  dateFns,
  user,
  userDef,
  deviceDefFile,
  device,
  devices,
  networks,
  platform,
  keys,
  keypair,
  isRPi,
  platformWithArchitecture,
  prepareDefMerge,
  defMerge,
  services,
  getGlobalIp,
  prettyFileSize
};
