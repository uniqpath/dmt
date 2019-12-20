const EventEmitter = require('events');
const colors = require('colors');
const { push } = require('dmt-notify');

const dmt = require('dmt-bridge');
const path = require('path');
const { log, scan, def } = dmt;

const controllerRPCService = require('../rpc/service');
const MetaRPC = require('./metaRPC');

const Store = require('./state/store');

const MidLoader = require('./middleware');

const initIntervalTicker = require('./interval');
const { setupTimeUpdater } = require('./interval/timeUpdater');
const onProgramTick = require('./onProgramTick');

const Network = require('../network');

function ensureDirectories() {
  const dirs = [];
  dirs.push('log');
  dirs.push('state');
  dirs.push('user/wallpapers');
  for (const dir of dirs) {
    scan.ensureDirSync(path.join(dmt.dmtPath, dir));
  }
}

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    this.defineServices();

    this.log = dmt.log;

    this.device = dmt.device();
    if (this.device.empty) {
      log.red(`missing device definition, please use ${colors.green('dmt device select')}`);
      log.red('EXITING, bye ✋');
      process.exit();
    }

    this.fiber = dmt.fiber();

    this.network = new Network(this);

    this.state = { notifications: [] };

    const deviceDefinition = { ...this.device };
    delete deviceDefinition.try;

    this.store = new Store(this, {
      initState: {
        controller: {
          deviceName: this.device.id,
          devMachine: dmt.isDevMachine(),
          devCluster: dmt.isDevCluster(),
          apMode: this.apMode()
        },
        deviceDefinition
      }
    });

    if (def.isTruthy(this.device.demo)) {
      this.updateState({ controller: { demoDevice: this.device.demo } }, { announce: false });
    } else {
      this.removeStoreElement({ storeName: 'controller', key: 'demoDevice' }, { announce: false });
    }

    if (def.isTruthy(this.device.serverMode)) {
      this.updateState({ controller: { serverMode: true } }, { announce: false });
    } else {
      this.removeStoreElement({ storeName: 'controller', key: 'serverMode' }, { announce: false });
    }

    process.on('uncaughtException', err => {
      const msg = `Caught global exception: ${err}`;
      log.red(msg);
      log.red(err.stack);
      log.red('EXITING, bye ✋');

      push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg} → PROCESS TERMINATED`, () => {
        process.exit();
      });
    });

    if (!this.device.id) {
      log.red('⚠️  Device definition is missing (device.def).');
    }

    log.cyan('Program booting ...');

    this.metaRPC = new MetaRPC(this);

    log.gray('Starting to load middleware ...');

    const midLoader = new MidLoader();

    if (mids.includes('user')) {
      midLoader.load({ program: this, mids: mids.filter(mid => mid != 'user') });
      midLoader.setup(this);

      midLoader.load({ program: this, mids: ['user'] });

      this.continueBooting();
    } else {
      midLoader.load({ program: this, mids });
      midLoader.setup(this);

      this.emit('user_core_ready');

      this.continueBooting();
    }

    setupTimeUpdater(this);
  }

  registerRpcService(service) {
    this.metaRPC.registerService(service);
  }

  continueBooting() {
    this.on('tick', () => onProgramTick(this));

    initIntervalTicker(this);

    this.registerRpcService(controllerRPCService);
    this.metaRPC.registrationsFinished();

    log.green('✓✓ Program ready');

    if (dmt.isRPi()) {
      this.updateState({ controller: { isRPi: true } }, { announce: false });
    } else if (this.state.controller) {
      delete this.state.controller.isRPi;
    }

    const debugInstructions = dmt.debugMode()
      ? colors.gray(`→ disable with: ${colors.yellow('dmt debug off')}`)
      : colors.gray(`→ enable with ${colors.green('dmt debug')}`);
    log.cyan(`${colors.magenta('DEBUG logging is: ')}${dmt.debugMode() ? '🔧 enabled' : 'disabled'} ${debugInstructions}`);

    if (dmt.isDevMachine()) {
      log.cyan(`${colors.magenta('DEV MACHINE: ')}: true`);
    }

    if (dmt.isDevCluster()) {
      log.cyan(`${colors.magenta('DEV CLUSTER: ')}: true`);
    }
  }

  latlng() {
    if (this.network) {
      return this.network.latlng();
    }
  }

  lang() {
    if (this.network) {
      return this.network.lang();
    }

    return 'eng';
  }

  apMode() {
    return dmt.apMode();
  }

  runsFiberServer() {
    return this.fiber.server == 'true';
  }

  hasGui() {
    return this.device.try('service[gui].disable') != 'true';
  }

  defineServices() {
    const services = dmt
      .services()
      .filter(service => service.id != 'player')
      .map(s => s.id);

    const playerServiceId = 'player';
    const playerService = dmt.services(playerServiceId);
    if (playerService && playerService.contentRef) {
      services.push(playerServiceId);
    }

    log.debug(`Services: ${colors.cyan(JSON.stringify(services, null, 2))}`);

    this.services = services.map(serviceId => dmt.services(serviceId)).filter(service => !service.empty);
  }

  showNotification({ id, msg, ttl, color, bgColor }) {
    const notification = {
      id,
      msg,
      color,
      bgColor,
      expireAt: Date.now() + ttl * 1000,
      addedAt: Date.now()
    };

    this.store.pushToStateArray('notifications', notification);
  }

  updateState(newState, { announce = true } = {}) {
    this.store.updateState(newState, { announce });
  }

  replaceState(replacement, { announce = true } = {}) {
    this.store.replaceState(replacement, { announce });
  }

  replaceStoreElement({ storeName, key, value }, { announce = true } = {}) {
    this.store.replaceStoreElement({ storeName, key, value }, { announce });
  }

  removeStoreElement({ storeName, key }, { announce = true } = {}) {
    this.store.removeStoreElement({ storeName, key }, { announce });
  }

  receiveAction({ action, storeName, payload }) {
    this.store.receiveAction({ action, storeName, payload });
  }

  initIot(iotBus) {
    this.iotBus = iotBus;
  }

  iotMsg(topic, msg) {
    if (this.iotBus) {
      this.iotBus.publish({ topic, msg });
    } else {
      log.yellow(
        `Tried to send an iot message ${topic} ■ ${msg} before iotBus was initialized... usually not a problem if message is periodic and will be resent again`
      );
    }
  }

  initInterprocBus(InterprocBus) {}
}

module.exports = (...args) => {
  return new Program(...args);
};
