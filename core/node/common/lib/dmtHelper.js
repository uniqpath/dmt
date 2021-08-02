import fs from 'fs';
import path from 'path';
import colors from 'colors';
import os from 'os';

const { homedir } = os;
const { username } = os.userInfo();

import isRPi from './detectRPi';
import def from './parsers/def/parser';

import util from './util';

import {
  dmtPath,
  dmtUserDir,
  stateDir,
  user,
  userDef,
  device,
  devices,
  deviceDefFile,
  isDevMachine,
  isDevCluster,
  debugMode,
  debugCategory
} from './dmtPreHelper';

import Logger from './logger';
const log = new Logger();

import * as dateFns from './timeutils/dateFnsCompacted';

const { hexToBuffer } = util.hexutils;

const dmtHerePath = path.join(homedir(), '.dmt-here');
const dmtCatalogsDir = path.join(dmtUserDir, 'catalogs');

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

function dmtHereEnsure(subdir) {
  const dir = path.join(dmtHerePath, subdir);
  util.mkdirp(dir);
  return dir;
}

export default {
  log,
  dmtPath,
  dmtHerePath,
  dmtHereEnsure,
  userDir: dmtUserDir,
  catalogsDir: dmtCatalogsDir,
  stateDir,
  globals,
  isDevMachine,
  isDevCluster,
  debugMode,
  debugCategory,
  dateFns,
  user,
  userDef,
  deviceDefFile,
  device,
  devices,

  isValidIPv4Address(ipaddress) {
    if (
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        ipaddress
      )
    ) {
      return true;
    }

    return false;
  },

  isMacOS() {
    return this.platform() == 'darwin';
  },

  isWindows() {
    return this.platform() == 'windows';
  },

  isLinux() {
    return this.platform() == 'linux';
  },

  isRPi() {
    return isRPi();
  },

  platform() {
    const { platform } = process;

    if (platform == 'win32') {
      return 'windows';
    }

    return platform;
  },

  platformDescription() {
    if (this.isRPi()) {
      return 'raspberry-pi';
    }

    return this.platformWithArchitecture();
  },

  platformWithArchitecture() {
    const platform = this.platform();

    if (platform == 'linux') {
      return `${platform}-${process.arch}`;
    }

    return platform;
  },

  platformExecutablePath(executable) {
    const platform = this.platformWithArchitecture();
    return path.join(this.dmtPath, `bin/${platform}/${executable}`);
  },

  parseDef(filePath, { caching = true }) {
    return def.parseFile(filePath, { caching });
  },

  userDefaults(str) {
    const defaults = def.parseFile(path.join(dmtUserDir, 'def/defaults.def')).try('defaults');
    if (str) {
      return defaults.try(str) || { empty: true };
    }
    return def.makeTryable(defaults || { empty: true });
  },

  userDeviceTypes() {
    const deviceTypes = def.parseFile(path.join(dmtUserDir, 'def/device_types.def'));
    return deviceTypes;
  },

  networks(networkId) {
    const netDef = userDef('networks.def');

    if (netDef) {
      const networks = netDef.multi;

      if (networkId) {
        const match = networks.find(network => network.id == networkId);
        return match || { empty: true };
      }

      return networks;
    }
  },

  deviceNetworkId() {
    return def.id(this.device().network);
  },

  networkDef(networkId) {
    const emptyObj = { empty: true };
    const network = (this.networks() || []).find(network => network.id == networkId);
    return def.makeTryable(network || emptyObj);
  },

  deviceDefIsMissing(deviceName = 'this') {
    const filePath = this.deviceDefFile(deviceName);
    return !fs.existsSync(filePath);
  },

  deviceDir(deviceName = this.device().id) {
    const devicesDir = path.join(dmtUserDir, 'devices');

    return path.join(devicesDir, deviceName);
  },

  peerConnections() {
    const filePath = this.deviceDefFile('this', 'connect');
    const connections = readConnectDef({ filePath });
    return connections.empty ? [] : connections;
  },

  keypair() {
    const keys = this.keys();
    if (keys) {
      const keypair = util.listify(keys).find(keypair => !keypair.id);
      if (keypair) {
        return { ...keypair, ...{ privateKey: hexToBuffer(keypair.privateKeyHex), publicKey: hexToBuffer(keypair.publicKeyHex) } };
      }
    }
  },

  keys() {
    if (!deviceKeypair) {
      const filePath = this.deviceDefFile('this', 'keys');
      deviceKeypair = readKeysDef({ filePath });
    }

    return deviceKeypair;
  },

  checkIfIdAlreadyPresentInList(prop, list, _id) {
    if (list.map(el => def.id(el)).includes(_id)) {
      throw new Error(`an element of key=${prop} with id=${_id} already exists, please make sure all ids for key=${prop} are unique`);
    }
  },

  prepareDefMerge({ fileList, key }) {
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
  },

  defMerge({ fileList, key }) {
    const toMerge = this.prepareDefMerge({ fileList, key });

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
  },

  determineGUIPort() {
    const isRootUser = username == 'root';

    const ports = def.listify(this.services('gui').port);

    const portForRootUser = ports.find(port => port.whenRootUser == 'true');

    if (isRootUser && portForRootUser) {
      return portForRootUser.id;
    }

    const normalPorts = ports.filter(port => port.whenRootUser != 'true');

    if (normalPorts.length > 0) {
      return def.id(normalPorts[0]);
    }
  },

  services(serviceId) {
    const name = 'services';
    const deviceName = 'this';

    const fileList = [];
    fileList.push(path.join(dmtPath, `def/${name}.def`));
    fileList.push(path.join(dmtUserDir, `def/${name}.def`));
    fileList.push(path.join(dmtUserDir, `devices/${deviceName}/def/${name}.def`));
    fileList.push({ filePath: path.join(dmtUserDir, `devices/${deviceName}/def/device.def`), secondLevel: true });

    const services = this.defMerge({ fileList, key: 'service' });

    const match = services.find(s => s.id == serviceId);
    const service = match || { empty: true };
    return serviceId ? def.makeTryable(service) : services;
  },

  accessTokens(service) {
    const tokensDef = def.parseFile(path.resolve(dmtUserDir, 'access_tokens', `${service}.def`));
    return tokensDef.multi.length > 0 ? tokensDef.multi[0] : null;
  },

  absolutizePath({ path, catalog, device }) {
    if (catalog) {
      return catalog.startsWith('/') ? catalog : require('path').join(dmtCatalogsDir, `${device.id}/${catalog}`);
    }

    if (path) {
      return device.id == this.device().id ? path.replace(/^~/, homedir()) : path;
    }
  },

  getIp({ deviceName }) {
    const match = devices({ onlyBasicParsing: true }).find(device => device.id == deviceName);

    if (match) {
      const ip = match.try('network.ip');
      if (ip) {
        return ip;
      }

      const globalIp = this.getGlobalIp({ deviceName });
      if (globalIp && !globalIp.error) {
        return globalIp;
      }

      return { error: `No ip or globalIp defined for ${colors.magenta(deviceName)}` };
    }

    return { error: colors.gray(`DMT Resolver is not recognizing hostname ${colors.yellow(deviceName)}`) };
  },

  getLocalIpViaNearby({ program, deviceName }) {
    const _deviceName = deviceName;
    const match = program
      .store('nearbyDevices')
      .get()
      .find(({ deviceName, stale }) => !stale && deviceName == _deviceName);
    if (match) {
      return match.ip;
    }
  },

  getGlobalIp({ deviceName }) {
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
};
