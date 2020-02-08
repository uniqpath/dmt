import EventEmitter from 'events';
import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;

import * as controllerRPCService from '../rpc/service';
import MetaRPC from './metaRPC';

import initIntervalTicker from './interval';
import { setupTimeUpdater } from './interval/timeUpdater';
import onProgramTick from './interval/onProgramTick';

import Network from '../network';

import ensureDirectories from './boot/ensureDirectories';
import getDeviceInfo from './boot/getDeviceInfo';
import initStore from './boot/initStore';
import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler';
import loadMiddleware from './boot/loadMiddleware';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    this.sideStore = {};

    this.log = dmt.log;
    this.device = getDeviceInfo();
    this.network = new Network(this);

    this.state = { notifications: [] };

    this.store = initStore(this, this.device);

    setupGlobalErrorHandler();

    log.cyan('Program booting ...');

    this.metaRPC = new MetaRPC(this);

    loadMiddleware(this, mids).then(() => {
      this.continueBooting();
    });
  }

  setResponsibleNode(isResponsible) {
    this.responsibleNode = isResponsible;
    this.emit('responsible_node_state_changed');
  }

  isResponsibleNode() {
    return this.responsibleNode;
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

    this.emit('program_ready');

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

  updateIntegrationsState(integrationsState) {
    this.updateState({ integrations: integrationsState }, { announce: false });
    this.emit('integrations_state_updated', this.state.integrations);
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
