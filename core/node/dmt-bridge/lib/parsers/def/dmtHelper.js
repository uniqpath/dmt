const fs = require('fs');
const path = require('path');
const colors = require('colors');
const homedir = require('homedir');
const def = require('./parser');
const cliParser = require('../cli/parser');
const scan = require('../../scan');

const dmtPath = path.join(homedir(), '.dmt');
const dmtUserDir = path.join(dmtPath, 'user');
const dmtCatalogsDir = path.join(dmtUserDir, 'catalogs');
const defDir = path.join(dmtUserDir, 'def');
const stateDir = path.join(dmtPath, 'state');

const DEF_EXTENSION = '.def';

const devices = [];
const devicesBasic = [];

function isDevMachine() {
  return fs.existsSync(path.join(dmtUserDir, 'devices/this/.dev-machine'));
}

function isDevCluster() {
  return isDevMachine() || fs.existsSync(path.join(dmtUserDir, 'devices/this/.dev-cluster'));
}

const globals = {
  tickerPeriod: 2,
  searchBinary: 'walksearch',
  searchLimit: {
    maxResults: 100,
    maxTimeLocalBinaryExecution: 30000
  },
  networkLimit: {
    maxTimeOneHop: 45000
  },
  fallbackToLocalCatalogs: false
};

function isValidIPv4Address(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    )
  ) {
    return true;
  }

  return false;
}

function getAllFuncs(obj) {
  return Object.getOwnPropertyNames(obj.prototype).filter(prop => prop != 'constructor' && typeof obj.prototype[prop] == 'function');
}

function includeModule(obj, Module) {
  const module = new Module();
  for (const func of getAllFuncs(Module)) {
    obj[func] = module[func].bind(obj);
  }
}

function readDeviceDef({ filePath, onlyBasicParsing, caching = true }) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`dmtHelper::readDeviceDef - Cannot read file ${colors.cyan(filePath)}`);
    }

    const deviceDef = def.parseFile(filePath, { onlyBasicParsing, caching });

    return def.makeTryable(deviceDef.multi.length > 0 ? deviceDef.device : { empty: true });
  } catch (e) {
    console.log(colors.red(e.message));
    process.exit();
  }
}

function readContentDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return def.makeTryable({ empty: true });
    }

    const contentDef = def.parseFile(filePath);

    return def.makeTryable(contentDef);
  } catch (e) {
    console.log(colors.red(e.message));
    process.exit();
  }
}

function readFiberDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return def.makeTryable({ empty: true });
    }

    const fiberDef = def.parseFile(filePath);

    return def.makeTryable(fiberDef.multi.length > 0 ? fiberDef.fiber : { empty: true });
  } catch (e) {
    console.log(colors.red(e.message));
    process.exit();
  }
}

function commonTruthSource() {
  if (this.user()) {
    const ts = this.user().commonTruthSource;
    if (ts) {
      return ts;
    }
  }
}

module.exports = {
  dmtPath,
  userDir: dmtUserDir,
  catalogsDir: dmtCatalogsDir,
  stateDir,
  globals,
  isDevMachine,
  isDevCluster,
  includeModule,
  commonTruthSource,

  debugMode(category = null) {
    const debugInfoFile = path.join(stateDir, '.debug-mode');

    if (fs.existsSync(debugInfoFile)) {
      if (category) {
        return this.debugCategory(category);
      }

      return true;
    }
  },

  debugCategory(category = null) {
    if (!this.deviceDef) {
      this.deviceDef = this.device({ onlyBasicParsing: false });
    }

    if (category) {
      const debugInfoFile = path.join(stateDir, '.debug-mode');

      const categoriesDebugModeFile = !fs.existsSync(debugInfoFile)
        ? []
        : scan
            .readFileLines(debugInfoFile)
            .map(line => line.trim())
            .filter(line => line != '' && !line.startsWith('#'));

      const categoriesDeviceDef = def.values(this.deviceDef.try('debug.log'));

      const categories = categoriesDebugModeFile.concat(categoriesDeviceDef);

      return categories.find(cat => cat == category);
    }
  },

  info() {
    const info = {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version
    };

    const versionFilePath = path.join(dmtPath, '.version');

    if (fs.existsSync(versionFilePath)) {
      const version = fs
        .readFileSync(versionFilePath)
        .toString()
        .replace(/(\n|\r)+$/, '');
      info.dmtVersion = version;
    }

    if (this.debugMode()) {
      info.debugMode = true;
    }

    if (isDevMachine()) {
      info.devMachine = true;
    }

    if (isDevCluster()) {
      info.devCluster = true;
    }

    return info;
  },

  nodeVersion() {
    const re = new RegExp(/^v(.*?)\.(.*?)\./);
    const matches = re.exec(process.version);
    if (matches) {
      return {
        major: parseInt(matches[1]),
        minor: parseInt(matches[2])
      };
    }
  },

  platformExecutablePath(executable) {
    let { platform } = process;

    if (platform == 'win32') {
      platform = 'windows';
    }

    if (platform == 'linux') {
      platform = `${platform}-${process.arch}`;
    }

    return path.join(this.dmtPath, `bin/${platform}/${executable}`);
  },

  parseDef(filePath, { caching = true }) {
    return def.parseFile(filePath, { caching });
  },

  user() {
    const userDef = this.userDef();
    if (userDef.user) {
      return def.makeTryable(userDef.user);
    }
    return def.makeTryable({ empty: true });
  },

  userDef(fileName = 'user', { onlyBasicParsing = false } = {}) {
    if (path.extname(fileName) != DEF_EXTENSION) {
      fileName = `${fileName}${DEF_EXTENSION}`;
    }

    const filePath = path.join(defDir, fileName);
    if (fs.existsSync(filePath)) {
      return def.parseFile(filePath, { onlyBasicParsing });
    }

    return def.makeTryable({ empty: true });
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
    const netDef = this.userDef('networks.def');

    if (netDef) {
      const networks = netDef.multi;

      if (networkId) {
        const match = networks.find(network => network.id == networkId);
        return match || { empty: true };
      }

      return networks;
    }
  },

  definedNetworkId() {
    return def.id(this.device().network);
  },

  networkDef(networkId) {
    const emptyObj = { empty: true };
    const network = (this.networks() || []).find(network => network.id == networkId);
    return def.makeTryable(network || emptyObj);
  },

  deviceDefFile(deviceId, file = 'device') {
    return path.join(dmtUserDir, `devices/${deviceId}/def/${file}.def`);
  },

  deviceDefIsMissing(deviceId = 'this') {
    const filePath = this.deviceDefFile(deviceId);
    return !fs.existsSync(filePath);
  },

  device({ deviceId = 'this', onlyBasicParsing = false, caching = true } = {}) {
    const defMissingMsg = `Cannot read ${colors.cyan('device.def')} file for ${colors.cyan(deviceId)} device`;

    if (deviceId == 'this') {
      const filePath = this.deviceDefFile(deviceId);
      if (!fs.existsSync(filePath)) {
        const msg = `${defMissingMsg} — make sure device is selected - use ${colors.green('dmt device select')} to select device`;
        console.log(colors.red(msg));
        process.exit();
      }
      return readDeviceDef({ filePath, onlyBasicParsing, caching });
    }

    const list = this.devices({ onlyBasicParsing, caching });

    const match = list.find(device => device.id == deviceId);

    if (!match) {
      console.log(colors.red(defMissingMsg));
      process.exit();
    }

    return match;
  },

  devices({ onlyBasicParsing = false, caching = true } = {}) {
    if (onlyBasicParsing && devicesBasic.length > 0) {
      return devicesBasic;
    }

    if (!onlyBasicParsing && devices.length > 0) {
      return devices;
    }

    const list = scan.dir(path.join(dmtUserDir, 'devices'), { onlyDirs: true });
    for (const deviceDir of list) {
      const deviceDefFile = path.join(deviceDir, 'def/device.def');
      if (fs.existsSync(deviceDefFile)) {
        const def = readDeviceDef({ filePath: deviceDefFile, onlyBasicParsing, caching });

        if (onlyBasicParsing) {
          devicesBasic.push(def);
        } else {
          devices.push(def);
        }
      }
    }

    return onlyBasicParsing ? devicesBasic : devices;
  },

  fiber() {
    const filePath = this.deviceDefFile('this', 'fiber');
    return readFiberDef({ filePath });
  },

  thisProvider() {
    return {
      ip: 'localhost',
      localhost: true,
      address: 'localhost'
    };
  },

  convertParsedAtAttributeToDmtAccessData(attrData) {
    let host = attrData.name;

    const deviceDefPresent = !this.deviceDefIsMissing(host);

    const thisDeviceId = this.device().id;

    let thisHost = false;

    if (deviceDefPresent) {
      if (host == 'this' || host == thisDeviceId) {
        host = thisDeviceId;
        thisHost = true;

        if (!thisDeviceId) {
          throw new Error(`Missing device name, probably the device is not selected ${colors.yellow('→ use')} ${colors.green('dev select')}`);
        }
      }
    }

    const data = { host };

    if (isValidIPv4Address(host)) {
      if (host.startsWith('192.168.')) {
        data.ip = host;
      } else {
        data.globalIp = host;
      }
    } else if (host.includes('.')) {
      if (host.toLowerCase().endsWith('.eth')) {
        data.hostType = 'ens';
      } else {
        data.hostType = 'dns';
      }
    }

    if (deviceDefPresent && !data.hostType && this.device({ deviceId: host }).id) {
      data.hostType = 'dmt';
    }

    if (attrData.afterSlash) {
      data.contentRef = attrData.afterSlash;
    }

    if (attrData.afterColon) {
      data.port = attrData.afterColon;
    }

    const isDmtDefinedDevice = data.hostType == 'dmt';

    if (thisHost) {
      data.ip = 'localhost';
      data.localhost = true;
    } else if (isDmtDefinedDevice) {
      if (!data.ip) {
        const ip = this.getIp({ deviceName: host });
        if (ip && !ip.error) {
          data.ip = ip;
        }
      }

      if (!data.globalIp) {
        const globalIp = this.getGlobalIp({ deviceName: host });
        if (globalIp && !globalIp.error) {
          data.globalIp = globalIp;
        }
      }
    }

    return data;
  },

  providersFromContentRefs(contentRefs) {
    contentRefs = contentRefs.map(contentRef => {
      if (contentRef.includes('/')) {
        return contentRef;
      }

      if (contentRef.startsWith('@')) {
        return contentRef;
      }

      return `@this/${contentRef}`;
    });
    return cliParser(contentRefs).map(parsed => this.convertParsedAtAttributeToDmtAccessData(parsed));
  },

  maxResults(serviceId = 'search') {
    const globalHardcodedLimit = this.globals.searchLimit.maxResults;

    let serverMaxResults = this.services(serviceId) && (this.services(serviceId).serverMaxResults || this.services(serviceId).maxResults);
    if (serverMaxResults) {
      serverMaxResults = Math.min(globalHardcodedLimit, serverMaxResults);
    }

    let serverMaxResultsForSearchService = this.services('search') && (this.services('search').serverMaxResults || this.services('search').maxResults);
    if (serverMaxResultsForSearchService) {
      serverMaxResultsForSearchService = Math.min(globalHardcodedLimit, serverMaxResultsForSearchService);
    }

    return {
      serverMaxResults: Math.min(globalHardcodedLimit, serverMaxResults || serverMaxResultsForSearchService)
    };
  },

  hostAddress(hostData) {
    if (hostData.localhost) {
      return 'localhost';
    }
    return hostData.ip || hostData.globalIp || hostData.host;
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

  services(serviceId) {
    const name = 'services';

    const fileList = [];
    fileList.push(path.join(dmtPath, `def/${name}.def`));
    fileList.push(path.join(dmtUserDir, `def/${name}.def`));
    fileList.push(path.join(dmtUserDir, `devices/this/def/${name}.def`));
    fileList.push({ filePath: path.join(dmtUserDir, 'devices/this/def/device.def'), secondLevel: true });

    const services = this.defMerge({ fileList, key: 'service' });

    const match = services.find(s => s.id == serviceId);
    const service = match || { empty: true };
    return serviceId ? def.makeTryable(service) : services;
  },

  remoteShareMappings() {
    const shareMappings = path.join(dmtUserDir, 'devices/this/def/mountpoints.def');

    if (!fs.existsSync(shareMappings)) {
      return {};
    }

    return def.parseFile(shareMappings);
  },

  absolutizePath({ path, catalog, device }) {
    if (catalog) {
      return catalog.startsWith('/') ? catalog : require('path').join(dmtCatalogsDir, `${device.id}/${catalog}`);
    }

    if (path) {
      return device.id == this.device().id ? path.replace(/^~/, homedir()) : path;
    }
  },

  contentPaths({ contentId, whichDevice = 'this' }) {
    const device = this.device({ deviceId: whichDevice });
    const filePath = this.deviceDefFile(whichDevice, 'content');
    const contentDef = readContentDef({ filePath });

    if (contentDef.empty) {
      return;
    }

    const content = contentDef.multi.find(c => c.id == contentId);

    if (content) {
      return def.values(content.path).map(path => this.absolutizePath({ path, device }));
    }
  },

  getIp({ deviceName }) {
    const match = this.devices({ onlyBasicParsing: true }).find(device => device.id == deviceName);

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

  getGlobalIp({ deviceName }) {
    const match = this.devices().find(device => device.id == deviceName);

    if (match) {
      const globalIp = def.id(match.try('network.globalIp'));
      if (globalIp) {
        return globalIp;
      }
      return { error: `Missing globalIp definition for ${colors.magenta(deviceName)}` };
    }

    return { error: colors.gray(`DMT Resolver is not recognizing hostname ${colors.yellow(deviceName)}`) };
  },

  accessTokens(service) {
    const tokensDef = def.parseFile(path.resolve(dmtUserDir, 'access_tokens', `${service}.def`));
    return tokensDef.multi.length > 0 ? tokensDef.multi[0] : null;
  }
};
