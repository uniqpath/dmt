const os = require('os');
const fs = require('fs');
const colors = require('colors');
const path = require('path');
const util = require('./lib/util');
const scan = require('./lib/scan');
const search = require('./lib/search');
const stopwatch = require('./lib/stopwatch');

const FsState = require('./lib/fsState');

const def = require('./lib/parsers/def/parser');
const helper = require('./lib/parsers/def/dmtHelper');
const cli = require('./lib/parsers/cli/cliHelper');
const numberRanges = require('./lib/parsers/numbers/rangeParser');
const FMLParser = require('./lib/parsers/fml/parser');
const textfileParsers = require('./lib/parsers/textfiles');

const { apMode, apInfo, accessPointIP } = require('./lib/apTools');

const suntime = require('./lib/suntime');

const db = require('./lib/databases');

if (!fs.existsSync(helper.dmtPath)) {
  console.log(
    `${colors.magenta('~/.dmt')} directory doesn't exist, please create it manually 🚀 ${colors.green('mkdir ~/.dmt')} — or via ${colors.cyan(
      'https://github.com/uniqpath/dmt'
    )}`
  );
  process.exit();
}

const Logger = require('./lib/logger');
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

module.exports = {
  log,
  util,
  scan,
  search,
  def,
  cli,
  FMLParser,
  textfileParsers,
  numberRanges,
  stopwatch,
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
  commonTruthSource: helper.commonTruthSource,

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
    const hasFiberServer = def.id(fiber.server) == 'true';

    const result = { hasFiberServer, connections, fiber };

    if (hasFiberServer) {
      const authorizedKeys = def.values(fiber.try('server.authorizedKeys.pubkey'));
      Object.assign(result, { authorizedKeys });
    }

    return result;
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

  convertParsedAtAttributeToDmtAccessData(attrData) {
    return helper.convertParsedAtAttributeToDmtAccessData(attrData);
  },

  constructProvider(device) {
    return helper.constructProvider(device);
  },

  providersFromContentRefs(contentRefs) {
    return helper.providersFromContentRefs(contentRefs);
  },

  contentPaths({ contentId, whichDevice }) {
    return helper.contentPaths({ contentId, whichDevice });
  },

  remoteShareMappings() {
    return helper.remoteShareMappings();
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
  thisProvider: helper.thisProvider,
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
  accessProperty: (obj, acc) => def.tryOnTheFly(obj, acc),
  mountutils: require('./lib/utilities/mountutils')
};
