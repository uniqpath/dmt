import EventEmitter from 'events';
import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

import { FiberPool, contentServer } from 'dmt/connectome';

import initControllerActor from '../actor';
import Actors from './actors';

import initIntervalTicker from './interval';
import { setupTimeUpdater } from './interval/timeUpdater';
import onProgramTick from './interval/onProgramTick';

import Network from '../network';
import Server from '../server/mainHttpServer';
import AppCustomPortHttpServer from '../server/appCustomPortHttpServer';
import WsServer from '../server/mainWsServer';

import ensureDirectories from './boot/ensureDirectories';
import getDeviceInfo from './boot/getDeviceInfo';
import initStore from './boot/initStore';
import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler';
import loadMiddleware from './boot/loadMiddleware';

import generateKeypair from './generateKeypair';
import ipcServer from './ipcServer/ipcServer';
import wsEndpoint from './wsEndpoint/wsEndpoint';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    this.sideStore = {};

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this.appCustomPortHttpServer = new AppCustomPortHttpServer(this);

    this.state = { notifications: [] };

    this.store = initStore(this, this.device);

    setupGlobalErrorHandler();

    log.cyan('Program booting ...');

    generateKeypair();

    this.actors = new Actors(this);

    this.wsServer = new WsServer(this);

    this.setupFiberNet();

    if (dmt.isRPi()) {
      this.updateState({ controller: { isRPi: true } }, { announce: false });
    } else if (this.state.controller) {
      delete this.state.controller.isRPi;
    }

    if (mids.includes('apps')) {
      if (!this.wsServer.ok()) {
        log.cyan(`Skipped ${colors.red('dmt/apps')} middleware because wsServer was not properly initialized`);

        loadMiddleware(
          this,
          mids.filter(mid => mid != 'apps')
        ).then(() => {
          this.continueBooting();
        });
      } else {
        let callCount = 0;
        const afterTwoCalls = callback => {
          callCount += 1;
          if (callCount == 2) {
            callback();
          }
        };

        this.on('apps_loaded', () => {
          afterTwoCalls(() => this.continueBooting());
        });

        loadMiddleware(this, mids).then(() => {
          afterTwoCalls(() => this.continueBooting());
        });
      }
    } else {
      loadMiddleware(this, mids).then(() => {
        this.continueBooting();
      });
    }
  }

  setResponsibleNode(isResponsible) {
    this.responsibleNode = isResponsible;
    this.emit('responsible_node_state_changed');
  }

  isResponsibleNode() {
    return this.responsibleNode;
  }

  registerActor(actor) {
    this.actors.register(actor);
  }

  actor(name) {
    return this.actors.get(name);
  }

  addWsEndpoint({ protocol, protocolLane, wsEndpoint }) {
    return this.wsServer.addWsEndpoint({ protocol, protocolLane, wsEndpoint });
  }

  setupFiberNet() {
    const port = 7780;
    const protocol = 'dmt';
    const protocolLane = 'fiber';

    this.addWsEndpoint({ protocol, protocolLane, wsEndpoint: wsEndpoint({ program: this, actors: this.actors }) });

    const keypair = dmt.keypair();
    if (!keypair) {
      log.red('Missing keypair, not preparing fiber pool...');
      return;
    }

    const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = keypair;

    this.fiberPool = new FiberPool({ protocol, protocolLane, port, clientPrivateKey, clientPublicKey });

    this.server.setupRoutes(app => contentServer({ app, fiberPool: this.fiberPool }));
  }

  continueBooting() {
    this.on('tick', () => onProgramTick(this));

    initIntervalTicker(this);

    initControllerActor(this);

    this.wsServer.start();

    this.server.listen();

    const { allowFollowers } = dmt.fiberInfo();

    if (allowFollowers) {
      this.appCustomPortHttpServer.listen();
    }

    ipcServer(this);
    log.green('Started IPC server');

    log.green('✓✓ Program ready');
    this.emit('ready');

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

    setupTimeUpdater(this);
  }

  latlng() {
    if (this.network) {
      return this.network.latlng();
    }
  }

  country() {
    if (this.network) {
      return this.network.country();
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

  hasGui() {
    return this.device.try('service[gui].disable') != 'true';
  }

  showNotification({ id, msg, ttl, color, bgColor }) {
    const DEFAULT_TTL = 30;

    const notification = {
      id,
      msg,
      color,
      bgColor,
      expireAt: Date.now() + (ttl || DEFAULT_TTL) * 1000,
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

export default (...args) => {
  return new Program(...args);
};
