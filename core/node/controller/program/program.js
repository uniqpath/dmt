import EventEmitter from 'events';
import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

import { push } from 'dmt/notify';

import { contentServer } from 'dmt/connectome-next';

import initControllerActor from '../actor';
import ActorManagement from './actorManagement/index.js';

import initIntervalTicker from './interval';
import { setupTimeUpdater } from './interval/timeUpdater';
import onProgramTick from './interval/onProgramTick';

import createFiberPool from './peerlist/createFiberPool';
import syncPeersToProgramState from './peerlist/syncPeersToProgramState';

import Network from '../network';
import Server from '../server/mainHttpServer';
import ProgramConnectionsAcceptor from '../server/programConnectionsAcceptor';

import ensureDirectories from './boot/ensureDirectories';
import preventMultipleMainDevices from './boot/preventMultipleMainDevices';
import getDeviceInfo from './boot/getDeviceInfo';
import createProgramStore from './createProgramStore/index.js';
import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler';
import loadMiddleware from './boot/loadMiddleware';

import generateKeypair from './generateKeypair';
import ipcServer from './ipcServer/ipcServer';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    generateKeypair();

    preventMultipleMainDevices();

    this.sideStore = {};

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this.store = createProgramStore(this);

    setupGlobalErrorHandler();

    log.cyan('Program booting ...');

    const port = 7780;
    const protocol = 'dmt';
    const lane = 'fiber';

    this.fiberPool = createFiberPool({ port, protocol, lane });

    this.fiberPool.subscribe(({ connectionList }) => {
      this.store.replaceSlot('connectionsOut', connectionList);
    });

    const emitter = new EventEmitter();

    emitter.on('file_request', data => {
      this.emit('file_request', data);
    });
    this.server.setupRoutes(app => contentServer({ app, connectorPool: this.fiberPool, defaultPort: port, emitter }));

    syncPeersToProgramState({ program: this, connectorPool: this.fiberPool, port });

    this.actors = new ActorManagement(this);
    this.acceptor = new ProgramConnectionsAcceptor(this);

    const onConnect = ({ program, channel }) => {
      channel
        .remoteObject('peerState')
        .call('set', { dmtVersion: dmt.dmtVersion() })
        .catch(e => {});

      channel.attachObject('remoteState', {
        set: ({ deviceName, deviceKey, state }) => {
          const slotName = 'remoteStates';
          const remoteStates = (program.store.get(slotName) || []).filter(entry => entry.deviceKey != deviceKey);

          remoteStates.push({ deviceName, deviceKey, state, updatedAt: Date.now() });

          program.store.replaceSlot(slotName, remoteStates, { announce: false });
        }
      });

      program.actors.setupChannel(channel);
    };

    this.registerProtocol({ protocol, lane, onConnect });

    if (dmt.isRPi()) {
      this.store.update({ device: { isRPi: true } }, { announce: false });
    } else if (this.state().device) {
      delete this.state().device.isRPi;
    }

    if (mids.includes('apps')) {
      if (!this.acceptor.ok()) {
        log.cyan(`Skipped ${colors.red('dmt/apps')} middleware because ProgramConnectionsAcceptor was not properly initialized`);

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

  registerActor(actor, options = {}) {
    this.actors.register(actor, options);
  }

  actor(name) {
    return this.actors.get(name);
  }

  registerProtocol({ protocol, lane, onConnect = () => {} }) {
    const onConnectWrap = ({ channel }) => onConnect({ program: this, channel });
    return this.acceptor.registerProtocol({ protocol, lane, onConnect: onConnectWrap });
  }

  peerlist() {
    const { peerlist } = this.state();
    if (peerlist) {
      return Object.entries(peerlist).map(([deviceName, values]) => {
        return { deviceName, ...values };
      });
    }

    return [];
  }

  continueBooting() {
    this.on('tick', () => onProgramTick(this));

    initIntervalTicker(this);

    initControllerActor(this);

    this.acceptor.start();

    this.server.listen();

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

  isHub() {
    return this.state().device.ip == dmt.accessPointIP;
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

    this.store.pushToSlotArrayElement('notifications', notification);
  }

  state() {
    return this.store.state();
  }

  setLanbus(lanbus) {
    this.lanbus = lanbus;
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
