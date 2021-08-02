import EventEmitter from 'events';
import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

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
import createProgramStore from './createProgramStore/createProgramStore.js';
import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler';
import loadMiddleware from './boot/loadMiddleware';
import reportOSUptime from './boot/reportOSUptime';

import generateKeypair from './generateKeypair';
import ipcServer from './ipcServer/ipcServer';
import ipcServerLegacy from './ipcServer/ipcServerLegacy';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    generateKeypair();

    preventMultipleMainDevices();

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this._store = createProgramStore(this);

    setupGlobalErrorHandler(this);

    log.cyan('dmt-proc booting ...');
    reportOSUptime();

    const port = 7780;
    const protocol = 'dmt/actors';
    this.fiberPool = createFiberPool({ port, protocol });

    this.fiberPool.subscribe(({ connectionList }) => {
      this.store('connectionsOut').set(connectionList);
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

      program.actors.setupChannel(channel);
    };

    this.registerProtocol({ protocol, onConnect });

    if (dmt.isRPi()) {
      this.store('device').update({ isRPi: true }, { announce: false });
    } else {
      this.store('device').removeKey('isRPi', { announce: false });
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
    const peerlist = this.store('peerlist').get();

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
    ipcServerLegacy(this);

    log.green('Started IPC server');

    log.green(`✓ ${colors.cyan('dmt-proc')} ${colors.magenta(dmt.dmtVersion())} booted`);
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
    return this.store('device').get().ip == dmt.accessPointIP;
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

    this.store('notifications').pushToArray(notification);
  }

  store(slotName) {
    if (slotName) {
      return this._store.slot(slotName);
    }

    return this._store;
  }

  setLanbus(lanbus) {
    this.lanbus = lanbus;
  }

  sendABC({ message, context }) {
    this.emit('send_abc', { message, context });
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
}

export default (...args) => {
  return new Program(...args);
};
