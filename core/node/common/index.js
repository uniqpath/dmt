import os from 'os';
import fs from 'fs';
import path from 'path';
import colors from 'colors';
import xstate from 'xstate';
import quantum from 'quantum-generator';
import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import util from './lib/util';
import scan from './lib/scan';
import sets from './lib/sets';
import tags from './lib/tags';
import * as quantile from './lib/quantile';
import stopwatch from './lib/timeutils/stopwatch';
import stopwatchAdv from './lib/timeutils/stopwatchAdv';
import prettyMicroDuration from './lib/timeutils/prettyMicroDuration';
import prettyTimeAge from './lib/timeutils/prettyTimeAge';
import * as suntime from './lib/timeutils/suntime';

import prettyFileSize from './lib/prettyFileSize';

import FsState from './lib/fsState';

import processBatch from './lib/processBatch';

import def from './lib/parsers/def/parser';
import parseCliArgs from './lib/parsers/cli/cliHelper';
import helper from './lib/dmtHelper';
import * as dmtContent from './lib/dmtContent';

import * as numberRanges from './lib/parsers/numbers/rangeParser';
import * as textfileParsers from './lib/parsers/textfiles';

import { apMode, apInfo, accessPointIP } from './lib/apTools';

nacl.util = naclutil;

if (!fs.existsSync(helper.dmtPath)) {
  console.log(
    `${colors.magenta('~/.dmt')} directory doesn't exist, please create it manually 🚀 ${colors.green('mkdir ~/.dmt')} — or via ${colors.cyan(
      'https://github.com/uniqpath/dmt'
    )}`
  );
  process.exit();
}

function promiseTimeout(ms, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms} ms.`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

function memoryUsage() {
  const memUsage = {};
  const used = process.memoryUsage();
  for (const key of Object.keys(used)) {
    memUsage[key] = `${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`;
  }
  return memUsage;
}

let _dmtVersion;

function dmtVersion(versionFile = path.join(helper.dmtPath, '.version')) {
  if (_dmtVersion) {
    return _dmtVersion;
  }

  if (fs.existsSync(versionFile)) {
    _dmtVersion = fs
      .readFileSync(versionFile)
      .toString()
      .trim();
    return _dmtVersion;
  }
}

function compareDmtVersions(_v1, _v2) {
  const re = new RegExp(/^[\d.]+/);

  const v1 = _v1.match(re)[0];
  const v2 = _v2.match(re)[0];

  const [v1a, v1b, v1c] = v1.split('.').map(n => parseInt(n));
  const [v2a, v2b, v2c] = v2.split('.').map(n => parseInt(n));

  if (v1a > v2a) {
    return 1;
  }
  if (v1a < v2a) {
    return -1;
  }
  if (v1b > v2b) {
    return 1;
  }
  if (v1b < v2b) {
    return -1;
  }
  if (v1c > v2c) {
    return 1;
  }
  if (v1c < v2c) {
    return -1;
  }
  return 0;
}

function versionCompareSymbol(otherDmtVersion) {
  if (!otherDmtVersion) {
    return '?';
  }

  const compareVersions = compareDmtVersions(otherDmtVersion, dmtVersion());

  if (compareVersions > 0) {
    return '↑';
  }

  if (compareVersions < 0) {
    return '↓';
  }

  return '≡';
}

export default {
  log: helper.log,
  util,
  scan,
  sets,
  tags,
  quantile,
  nacl,
  xstate,
  quantum,
  colors,
  def,
  dmtVersion,
  compareDmtVersions,
  versionCompareSymbol,
  parseCliArgs,
  dmtContent,
  processBatch,
  textfileParsers,
  numberRanges,
  prettyFileSize,
  suntime,
  prettyMicroDuration,
  prettyTimeAge,
  stopwatch,
  stopwatchAdv,
  apMode,
  apInfo,
  accessPointIP,

  loop: util.periodicRepeat,

  guiViews: () => {
    const viewsDefFile = path.join(helper.dmtPath, 'def/gui_views.def');
    return def.values(helper.parseDef(viewsDefFile, { caching: false }).multi);
  },

  isInstalled() {
    return fs.existsSync(helper.dmtPath);
  },

  deviceDefFile: helper.deviceDefFile,
  dateFns: helper.dateFns,

  parseDef(...args) {
    return helper.parseDef(...args);
  },

  userDef(file, options = {}) {
    return helper.userDef(file, options);
  },

  user() {
    return helper.user();
  },

  programStateFile: path.join(helper.dmtPath, 'state/program.json'),
  memoryUsage,

  deviceGeneralIdentifier() {
    const deviceName = this.device({ onlyBasicParsing: true }).id;
    const hostname = os.hostname();

    return deviceName == hostname ? deviceName : `${deviceName} (os hostname: ${hostname})`;
  },

  userDefaults(defPath) {
    return helper.userDefaults(defPath);
  },

  userDeviceTypes(type) {
    return helper.userDeviceTypes(type);
  },

  definedNetworkId() {
    return helper.definedNetworkId();
  },

  networkDef(networkId) {
    return helper.networkDef(networkId);
  },

  networks(network) {
    return helper.networks(network);
  },

  determineGUIPort: helper.determineGUIPort,

  services(service) {
    return helper.services(service);
  },

  device(options) {
    return helper.device(options);
  },

  devices(options) {
    return helper.devices(options);
  },

  peerConnections() {
    const connections = helper.peerConnections();

    return connections
      .map(({ id, syncState }) => {
        if (id.includes('.')) {
          const address = id;
          return { address, deviceTag: address, syncState };
        }

        const deviceName = id;
        const globalIp = helper.getIp({ deviceName });
        return { deviceName, address: globalIp, deviceTag: deviceName, syncState };
      })
      .filter(({ address }) => !address.error)
      .sort(util.orderBy('deviceTag'));
  },

  keypair() {
    return helper.keypair();
  },

  keys() {
    return helper.keys();
  },

  networkSegment(opts) {
    return helper.networkSegment(opts);
  },

  defaultKey() {
    const keys = helper.keys();
    if (keys.length > 0) {
      return keys.find(keyInfo => !def.id(keyInfo));
    }
  },

  deviceKeyDefFile() {
    return helper.deviceDefFile('this', 'keys');
  },

  getIp({ deviceName }) {
    return helper.getIp({ deviceName });
  },

  getLocalIpViaNearby({ program, deviceName }) {
    return helper.getLocalIpViaNearby({ program, deviceName });
  },

  getGlobalIp({ deviceName }) {
    return helper.getGlobalIp({ deviceName });
  },

  accessTokens(...args) {
    return helper.accessTokens(...args);
  },

  platformExecutablePath(executable) {
    return helper.platformExecutablePath(executable);
  },

  isDevMachine: helper.isDevMachine,
  isDevCluster: helper.isDevCluster,
  debugMode: helper.debugMode,
  debugCategory: helper.debugCategory,
  includeModule: helper.includeModule,
  determineTimeAndDate: helper.determineTimeAndDate,
  fsState: new FsState(helper.stateDir),
  stateDir: helper.stateDir,
  dmtPath: helper.dmtPath,
  dmtHereEnsure: helper.dmtHereEnsure,
  dmtHerePath: helper.dmtHerePath,
  userDir: helper.userDir,
  deviceDir: helper.deviceDir,
  catalogsDir: helper.catalogsDir,
  assetsDir: path.join(helper.dmtPath, 'core/assets'),
  accessTokensDir: path.join(helper.userDir, 'access_tokens'),
  isMacOS: () => {
    return helper.isMacOS();
  },
  isWindows: () => {
    return helper.isWindows();
  },
  isLinux: () => {
    return helper.isLinux();
  },
  isRPi: () => {
    return helper.isRPi();
  },
  platformDescription: () => {
    return helper.platformDescription();
  },
  globals: helper.globals,
  promiseTimeout,
  listify: util.listify,
  accessProperty: (obj, acc) => def.tryOnTheFly(obj, acc)
};
