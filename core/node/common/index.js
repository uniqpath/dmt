import os from 'os';
import fs from 'fs';
import path from 'path';
import express from 'express';
import xstate from 'xstate';
import quantum from 'quantum-generator';
import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { holidaysForYear, holidayDataExists, isHoliday } from 'dmt/holidays';

import util from './lib/util.js';
import scan from './lib/scan.js';
import sets from './lib/sets.js';
import tags from './lib/tags.js';
import * as quantile from './lib/quantile.js';
import setupProtocolConnectionsCounter from './lib/protocolHelpers/setupConnectionsCounter.js';

import * as formatNumber from './lib/formatNumber/formatNumber.js';

import stopwatch from './lib/timeutils/stopwatch.js';
import stopwatchAdv from './lib/timeutils/stopwatchAdv.js';

import * as timeutils from './lib/timeutils/index.js';
import * as suntime from './lib/timeutils/suntime/index.js';

import stripAnsi from 'strip-ansi';
import meetup from './lib/meetup/index.js';

import FsState from './lib/fsState.js';

import processBatch from './lib/processBatch.js';
import ipc from './lib/ipc/ipc.js';

import identifyDeviceByMac from './lib/identifyDeviceByMac.js';

import def from './lib/parsers/def/parser.js';
import parseCliArgs from './lib/parsers/cli/cliHelper.js';
import * as helper from './lib/dmtHelper.js';
import * as dmtContent from './lib/dmtContent.js';

const { colors, colors2 } = helper;

import * as numberRanges from './lib/parsers/numbers/rangeParser.js';
import * as textfileParsers from './lib/parsers/textfiles/index.js';

import { apMode, apInfo, accessPointIP } from './lib/apTools.js';

nacl.util = naclutil;

const dmtSocket = path.join(helper.dmtPath, 'state/ipc.dmt-proc.sock');
const abcSocket = path.join(helper.dmtPath, 'state/ipc.abc-proc.sock');
const abcProcPath = path.join(helper.dmtPath, 'core/node/controller/processes/abc-proc.js');

const dmtProcPath = path.join(helper.dmtPath, 'core/node/controller/processes/dmt-proc.js');
const dmtProcManagerPath = path.join(helper.dmtPath, 'core/node/controller/processes/manager.js');
const daemonsPath = path.join(helper.dmtPath, 'core/node/controller/processes');
const assetsDir = path.join(helper.dmtPath, 'core/assets');
const accessTokensDir = path.join(helper.dmtUserDir, 'access_tokens');
const programStateFile = path.join(helper.dmtPath, 'state/program.json');

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

function dmtVersion() {
  if (_dmtVersion) {
    return _dmtVersion;
  }

  const versionFile = path.join(helper.dmtPath, '.version');

  if (fs.existsSync(versionFile)) {
    _dmtVersion = fs
      .readFileSync(versionFile)
      .toString()
      .trim();
    return _dmtVersion;
  }

  throw new Error(`Missing version file: ${versionFile}`);
}

function abcVersion({ allowCrash = true } = {}) {
  const versionFile = path.join(helper.dmtPath, '/etc/.abc_version');

  if (!allowCrash && !fs.existsSync(versionFile)) {
    return;
  }

  try {
    return fs
      .readFileSync(versionFile)
      .toString()
      .trim();
  } catch (e) {
    if (allowCrash) {
      throw e;
    }
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

const nodeFlags = ['--unhandled-rejections=strict'];

const {
  globals,
  log,
  disconnectedIPAddress,
  deviceDefFile,
  dateFns,
  determineGUIPort,
  isDevMachine,
  isDevUser,
  isMainDevice,
  isMainServer,
  isPersonalComputer,
  isLanServer,
  isDevPanel,
  isValidIPv4Address,
  debugMode,
  debugCategory,

  dmtStateDir,
  dmtPath,
  dmtHereEnsure,
  dmtHerePath,
  dmtUserDir,
  deviceDir,
  catalogsDir,
  prettyFileSize
} = helper;

const { periodicRepeat: loop, listify } = util;

const fsState = new FsState(dmtStateDir);

function guiViews() {
  const viewsDefFile = path.join(helper.dmtPath, 'def/gui_views.def');
  return def.values(helper.parseDef(viewsDefFile, { caching: false }).multi);
}

function isInstalled() {
  return fs.existsSync(helper.dmtPath);
}

function parseDef(...args) {
  return helper.parseDef(...args);
}

function userDef(file, options = {}) {
  return helper.userDef(file, options);
}

function user() {
  return helper.user();
}

function deviceGeneralIdentifier() {
  const deviceName = device({ onlyBasicParsing: true }).id;
  const hostname = os.hostname();

  return deviceName == hostname ? deviceName : `${deviceName} (host ${hostname})`;
}

function userDefaults(defPath) {
  return helper.userDefaults(defPath);
}

function userDeviceTypes(type) {
  return helper.userDeviceTypes(type);
}

function deviceNetworkId() {
  return helper.deviceNetworkId();
}

function networkDef(networkId) {
  return helper.networkDef(networkId);
}

function networks(network) {
  return helper.networks(network);
}

function services(service) {
  return helper.services(service);
}

function device(options) {
  return helper.device(options);
}

function devices(options) {
  return helper.devices(options);
}

function peerConnections() {
  const connections = helper.peerConnections();

  return connections
    .map(({ id, deviceTag, syncState }) => {
      if (id.includes('.')) {
        const address = id;
        return { address, deviceTag: deviceTag || address, syncState };
      }

      const deviceName = id;
      const globalIp = helper.getIp({ deviceName });
      return { deviceName, address: globalIp, deviceTag: deviceName, syncState };
    })
    .filter(({ address }) => !address.error)
    .sort(util.orderBy('deviceTag'));
}

function keypair() {
  return helper.keypair();
}

function keys() {
  return helper.keys();
}

function defaultKey() {
  const keys = helper.keys();
  if (keys.length > 0) {
    return keys.find(keyInfo => !def.id(keyInfo));
  }
}

function deviceKeyDefFile() {
  return helper.deviceDefFile('this', 'keys');
}

function getIp({ deviceName }) {
  return helper.getIp({ deviceName });
}

function getLocalIpViaNearby({ program, deviceName }) {
  return helper.getLocalIpViaNearby({ program, deviceName });
}

function getGlobalIp({ deviceName }) {
  return helper.getGlobalIp({ deviceName });
}

function accessTokens(...args) {
  return helper.accessTokens(...args);
}

function platformExecutablePath(executable) {
  return helper.platformExecutablePath(executable);
}

function isMacOS() {
  return helper.isMacOS();
}
function isWindows() {
  return helper.isWindows();
}
function isLinux() {
  return helper.isLinux();
}
function isRPi() {
  return helper.isRPi();
}
function platformDescription() {
  return helper.platformDescription();
}

let program;

function setProgram(p) {
  program = p;
  return p;
}

export {
  program,
  setProgram,
  abcProcPath,
  abcSocket,
  dmtProcPath,
  dmtSocket,
  dmtProcManagerPath,
  daemonsPath,
  nodeFlags,
  ipc,
  log,
  util,
  scan,
  sets,
  tags,
  quantile,
  nacl,
  xstate,
  quantum,
  colors,
  colors2,
  express,
  def,
  dmtVersion,
  abcVersion,
  compareDmtVersions,
  versionCompareSymbol,
  parseCliArgs,
  dmtContent,
  processBatch,
  identifyDeviceByMac,
  textfileParsers,
  numberRanges,
  prettyFileSize,
  suntime,
  formatNumber,
  timeutils,
  stopwatch,
  stopwatchAdv,
  apMode,
  apInfo,
  accessPointIP,
  disconnectedIPAddress,
  meetup,
  loop,
  listify,
  guiViews,
  isInstalled,
  deviceDefFile,
  dateFns,
  holidaysForYear,
  isHoliday,
  holidayDataExists,
  determineGUIPort,
  programStateFile,
  memoryUsage,
  parseDef,
  userDef,
  user,
  deviceGeneralIdentifier,
  userDefaults,
  userDeviceTypes,
  deviceNetworkId,
  networkDef,
  networks,
  services,
  device,
  devices,
  peerConnections,
  keypair,
  keys,
  defaultKey,
  deviceKeyDefFile,
  getIp,
  getLocalIpViaNearby,
  getGlobalIp,
  accessTokens,
  platformExecutablePath,
  isMacOS,
  isWindows,
  isLinux,
  isRPi,
  platformDescription,
  isDevMachine,
  isPersonalComputer,
  isDevUser,
  isMainDevice,
  isMainServer,
  isLanServer,
  isDevPanel,
  isValidIPv4Address,
  debugMode,
  debugCategory,
  fsState,
  stripAnsi,
  setupProtocolConnectionsCounter,
  dmtStateDir,
  dmtPath,
  dmtHereEnsure,
  dmtHerePath,
  dmtUserDir,
  deviceDir,
  catalogsDir,
  assetsDir,
  accessTokensDir,
  globals,
  promiseTimeout
};
