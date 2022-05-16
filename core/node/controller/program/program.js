import EventEmitter from 'events';

import * as dmt from 'dmt/common';
const { log, colors, colors2 } = dmt;

import { desktop } from 'dmt/notify';

import { contentServer } from 'dmt/connectome-next';

import initControllerActor from '../actor';
import ActorManagement from './actorManagement/index.js';

import initIntervalTicker from './interval';
import { setupTimeUpdater } from './interval/timeUpdater';
import onProgramTick from './interval/onProgramTick';
import onProgramSlowTick from './interval/onProgramSlowTick';

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
import exceptionNotify from './exceptionNotify';
import ipcServer from './ipcServer/ipcServer';
import ipcServerLegacy from './ipcServer/ipcServerLegacy';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    this.on('ready', () => {
      this.notifyMainDevice({ msg: 'Ready', ttl: 10, color: '#50887E' });
    });

    this.mqttHandlers = [];

    ensureDirectories();

    generateKeypair();

    preventMultipleMainDevices();

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this._store = createProgramStore(this);

    setupGlobalErrorHandler(this);

    log.green(`${colors.cyan('dmt-proc')} is starting ${this.runningInTerminalForeground() ? colors.magenta('in terminal foreground ') : ''}…`);

    reportOSUptime();

    const port = 7780;
    const protocol = 'dmt';
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
      channel.attachObject('dmt', {
        version: () => dmt.dmtVersion()
      });

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

  runningInTerminalForeground() {
    return log.isForeground();
  }

  exceptionNotify(msg, origin) {
    if (origin) {
      msg = `${origin}: ${msg} (check log for details, not restarting dmt-proc)`;
    }

    return exceptionNotify({ program: this, msg });
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
    this.on('slowtick', () => onProgramSlowTick(this));

    initControllerActor(this);

    this.acceptor.start();

    this.server.listen();

    ipcServer(this);
    ipcServerLegacy(this);

    log.green('Started IPC server');

    this.on('ready', () => {
      log.green(`✓ ${colors.cyan('dmt-proc')} ${colors.bold().white(`v${dmt.dmtVersion()}`)} ${colors.cyan('ready')}`);

      initIntervalTicker(this);

      const debugInstructions = dmt.debugMode()
        ? colors.white(`→ disable with: ${colors.green('dmt debug off')}`)
        : colors.white(`→ enable with ${colors.green('dmt debug')}`);
      log.cyan(`${colors.magenta('Debug logging: ')}${dmt.debugMode() ? '🔧 enabled' : colors.gray('disabled')} ${debugInstructions}`);

      if (dmt.isDevMachine()) {
        log.cyan(`${colors.magenta('Dev machine:')} true`);
      }

      if (dmt.isDevUser()) {
        log.cyan(`${colors.magenta('Dev user:')} true`);
      }

      setupTimeUpdater(this);
    });

    this.emit('nearby_setup');
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

  isHub() {
    return this.store('device').get('ip') == dmt.accessPointIP;
  }

  hasGui() {
    return this.device.try('service[gui].disable') != 'true';
  }

  hasValidIP() {
    const { ip } = this.store('device').get();
    if (ip && !dmt.disconnectedIPAddress(ip)) {
      return true;
    }
  }

  store(slotName) {
    if (slotName) {
      return this._store.slot(slotName);
    }

    return this._store;
  }

  sendABC({ message, context }) {
    this.emit('send_abc', { message, context });
  }

  setPlayer(player) {
    this._player = player;
  }

  player() {
    return this._player;
  }

  isDevPanel() {
    const devPanels = ['fpanel', 'gpanel', 'dpanel', 'tablica', 'epanel'];
    return dmt.isDevUser() && (devPanels.includes(this.device.id) || dmt.isMainDevice());
  }

  showNotification(
    { title, msg, ttl = 30, color = '#FFFFFF', group, cancelIds = [], omitDeviceName = false, noDesktopNotification = false, dev = false },
    { originDevice = undefined } = {}
  ) {
    if (dev && (!dmt.isDevUser() || !this.isDevPanel())) {
      return;
    }

    const bgColor = color;

    const id = Math.random();

    let _title;

    if (originDevice) {
      if (omitDeviceName) {
        _title = title;
      } else if (!title) {
        _title = originDevice;
      } else {
        _title = `${originDevice} · ${title}`;
      }
    } else {
      _title = omitDeviceName ? title : title || this.device.id;
    }

    const notification = {
      __id: id,
      title: _title,
      msg,
      bgColor,
      color: colors2.invertColor(bgColor),
      group,
      expireAt: Date.now() + ttl * 1000,
      addedAt: Date.now()
    };

    this.store('notifications').removeArrayElements(
      n => {
        return cancelIds.includes(n.__id) || (group && n.group == group);
      },
      { announce: false }
    );

    this.store('notifications').push(notification);

    if (dmt.isMainDevice() && !noDesktopNotification) {
      desktop.notify(msg, _title);
    }

    return id;
  }

  nearbyNotification(obj) {
    const { dev } = obj;

    if (dev && !dmt.isDevUser()) {
      return;
    }

    if (!dev || (dev && this.isDevPanel())) {
      this.showNotification(obj);
    }

    if (this._nearby) {
      this._nearby.broadcast('notification', obj);
    } else {
      log.red('⚠️  Dropping nearbyNotification ↴');
      log.yellow(obj);
      log.red(`Tried to send too early, please start sending only after ${colors.yellow("program.on('ready')")}`);
    }
  }

  notifyMainDevice(obj) {
    if (this._nearby) {
      this._nearby.broadcast('notify_main_device', obj);
    } else {
      log.red('⚠️  Dropping notifyMainDevice ↴');
      log.yellow(obj);
      log.red(`Tried to send too early, please start sending only after ${colors.yellow("program.on('ready')")}`);
    }
  }

  setNearby(nearby) {
    this._nearby = nearby;

    nearby.on('notification', ({ originDevice, obj }) => {
      if (this.device.id == originDevice) {
        return;
      }

      this.showNotification(obj, { originDevice });
    });

    nearby.on('notify_main_device', ({ originDevice, obj }) => {
      if (this.device.id == originDevice) {
        return;
      }

      if (dmt.isMainDevice()) {
        this.showNotification(obj, { originDevice });
      }
    });
  }

  nearby() {
    return this._nearby;
  }
}

export default (...args) => {
  return new Program(...args);
};
