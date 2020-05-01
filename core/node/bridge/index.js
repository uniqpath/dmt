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
import stopwatch from './lib/timeutils/stopwatch';
import stopwatchAdv from './lib/timeutils/stopwatchAdv';
import prettyMicroTime from './lib/timeutils/prettyMicroTime';
import prettyMacroTime from './lib/timeutils/prettyMacroTime';
import prettyFileSize from './lib/prettyFileSize';

import FsState from './lib/fsState';

import processBatch from './lib/processBatch';

import def from './lib/parsers/def/parser';
import cli from './lib/parsers/cli/cliHelper';
import helper from './lib/dmtHelper';

import * as numberRanges from './lib/parsers/numbers/rangeParser';
import * as textfileParsers from './lib/parsers/textfiles';

import { apMode, apInfo, accessPointIP } from './lib/apTools';

import * as suntime from './lib/timeutils/suntime';
import db from './lib/databases';

nacl.util = naclutil;

if (!fs.existsSync(helper.dmtPath)) {
  console.log(
    `${colors.magenta('~/.dmt')} directory doesn't exist, please create it manually 🚀 ${colors.green('mkdir ~/.dmt')} — or via ${colors.cyan(
      'https://github.com/uniqpath/dmt'
    )}`
  );
  process.exit();
}

import Logger from './lib/logger';
const log = new Logger();

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

export default {
  log,
  util,
  scan,
  nacl,
  xstate,
  quantum,
  colors,
  def,
  cli,
  processBatch,
  textfileParsers,
  numberRanges,
  prettyFileSize,
  prettyMicroTime,
  prettyMacroTime,
  stopwatch,
  stopwatchAdv,
  apMode,
  apInfo,
  accessPointIP,
  db,
  suntime,
  loop: util.periodicRepeat,
  guiViews: () => {
    const viewsDefFile = path.join(helper.dmtPath, 'def/gui_views.def');
    return def.values(helper.parseDef(viewsDefFile, { caching: false }).multi);
  },

  isInstalled() {
    return fs.existsSync(helper.dmtPath);
  },

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
    const deviceId = this.device({ onlyBasicParsing: true }).id;
    const hostname = os.hostname();

    return deviceId == hostname ? deviceId : `${deviceId} (os hostname: ${hostname})`;
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

  maxResults(serviceId, cliArgs) {
    return helper.maxResults(serviceId, cliArgs);
  },

  hostAddress(hostData) {
    return helper.hostAddress(hostData);
  },

  device(options) {
    return helper.device(options);
  },

  devices(options) {
    return helper.devices(options);
  },

  fiberInfo() {
    const fiber = helper.fiber();

    const connections = def.listify(fiber.connect);
    const allowFollowers = def.id(fiber.server) == 'true';

    const result = { allowFollowers, connections, fiber };

    if (allowFollowers) {
      const authorizedKeys = def.values(fiber.try('server.authorizedKeys.pubkey'));
      Object.assign(result, { authorizedKeys });
    }

    return result;
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

  parseProviderReference(attrData) {
    return helper.parseProviderReference(attrData);
  },

  constructProvider(device) {
    return helper.constructProvider(device);
  },

  providersFromContentRefs(contentRefs) {
    return helper.providersFromContentRefs(contentRefs);
  },

  getContentIDs() {
    return helper.getContentIDs();
  },

  contentPaths({ contentId, deviceId, returnSambaSharesInfo }) {
    return helper.contentPaths({ contentId, deviceId, returnSambaSharesInfo });
  },

  getReferencedSambaShares() {
    return helper.getReferencedSambaShares();
  },

  getIp({ deviceName }) {
    return helper.getIp({ deviceName });
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
  debugExit() {
    console.log(colors.red('Stopping here as specified for debug mode'));
    process.exit();
  },
  fsState: new FsState(helper.stateDir),
  stateDir: helper.stateDir,
  dmtPath: helper.dmtPath,
  userDir: helper.userDir,
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
  globals: helper.globals,
  promiseTimeout,
  listify: util.listify,
  accessProperty: (obj, acc) => def.tryOnTheFly(obj, acc)
};
