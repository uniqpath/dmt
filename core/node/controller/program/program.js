import EventEmitter from 'events';

import * as dmt from 'dmt/common';
const { log, colors, colors2, def } = dmt;

import { desktop, apn, push } from 'dmt/notify';

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

    this.mqttHandlers = [];

    this.cachedNearbyNotifications = [];
    this.cachedMainDeviceNotifications = [];

    ensureDirectories();

    generateKeypair();

    preventMultipleMainDevices();

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this._store = createProgramStore(this);

    setupGlobalErrorHandler(this);

    this.on('ready', () => {
      if (!dmt.isMainDevice()) {
        this.nearbyNotification({ msg: 'dmt-proc started', ttl: 10, color: '#50887E', dev: true });

        setTimeout(
          () => {
            if (this.network.name() == 'zaboric') {
              apn.notify(`Started DMT v${dmt.dmtVersion()}`);
            }
          },
          dmt.isRPi() ? 7000 : 1000
        );
      }
      this.sendCachedNearbyNotifications();
      this.sendCachedMainDeviceNotifications();
    });

    log.green(`${colors.cyan('dmt-proc')} is starting ${this.runningInTerminalForeground() ? colors.magenta('in terminal foreground ') : ''}…`);

    reportOSUptime();

    const port = 7780;
    const protocol = 'dmt';
    this.fiberPool = createFiberPool({ port, protocol });

    if (dmt.isDevUser() && !dmt.isMainDevice()) {
      this.fiberPool.on('inactive_connection', connector => {
        const msg = `⚠️  Inactive_connection to ${connector.endpoint}, check log`;
        this.nearbyNotification({ msg, ttl: 30, dev: true, color: '#EDDE29', omitDesktopNotification: true });
        apn.notify(msg);
      });
    }

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

    setTimeout(() => {
      this.acceptor.start();
    }, 200);

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
    const definedIp = this.device.try('network.ip');
    const assignedIp = this.store('device').get('ip');

    const { accessPointIP } = dmt;

    return (!assignedIp && definedIp == accessPointIP) || assignedIp == accessPointIP;
  }

  getPrimaryLanServer() {
    const lanServers = this.store('nearbyDevices')
      .get()
      .filter(({ lanServer, ip, stale }) => lanServer && !stale && dmt.isValidIPv4Address(ip) && !dmt.disconnectedIPAddress(ip))
      .sort((a, b) => {
        const num1 = Number(
          a.ip
            .split('.')
            .map(num => `000${num}`.slice(-3))
            .join('')
        );
        const num2 = Number(
          b.ip
            .split('.')
            .map(num => `000${num}`.slice(-3))
            .join('')
        );
        return num1 - num2;
      });

    if (lanServers.length > 0) {
      return lanServers[0];
    }
  }

  isPrimaryLanServer() {
    return dmt.isLanServer() && this.getPrimaryLanServer()?.thisDevice;
  }

  lanServerNearby() {
    return !!this.store('nearbyDevices')
      .get()
      .find(({ lanServer, stale, thisDevice, ip }) => lanServer && !thisDevice && !stale && dmt.isValidIPv4Address(ip) && !dmt.disconnectedIPAddress(ip));
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

  showDevNotifications() {
    return dmt.isDevPanel() || dmt.isMainDevice();
  }

  showNotification(
    { title, msg, ttl = 30, color = '#FFFFFF', group, cancelIds = [], omitDeviceName = false, omitDesktopNotification = false, dev = false },
    { originDevice = undefined } = {}
  ) {
    if (dev && !this.showDevNotifications()) {
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
      title: dev ? `${_title} [DΞV]` : _title,
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
      { announce: !msg }
    );

    if (msg) {
      this.store('notifications').push(notification);

      if (dmt.isMainDevice() && !omitDesktopNotification) {
        desktop.notify(msg, _title);
      }

      return id;
    }
  }

  nearbyNotification(obj) {
    const { dev } = obj;

    if (dev && !dmt.isDevUser()) {
      return;
    }

    if (!dev || (dev && this.showDevNotifications())) {
      this.showNotification(obj);
    }

    if (this._nearby) {
      this._nearby.broadcast('notification', obj);
    } else {
      this.cachedNearbyNotifications.push(obj);
    }
  }

  sendCachedNearbyNotifications() {
    while (this.cachedNearbyNotifications.length) {
      this.nearbyNotification(this.cachedNearbyNotifications.shift());
    }
  }

  notifyMainDevice(obj) {
    if (this._nearby) {
      this._nearby.broadcast('notify_main_device', obj);
    } else {
      this.cachedMainDeviceNotifications.push(obj);
    }
  }

  nearbyProxyApnMsgViaLanServer(obj) {
    if (this._nearby) {
      this._nearby.broadcast('proxy_apn_notification', obj);
    } else {
      throw new Error('Too early, todo: cache');
    }
  }

  nearbyProxyPushMsgViaLanServer(obj) {
    if (this._nearby) {
      this._nearby.broadcast('proxy_push_notification', obj);
    } else {
      throw new Error('Too early, todo: cache');
    }
  }

  sendCachedMainDeviceNotifications() {
    while (this.cachedMainDeviceNotifications.length) {
      this.notifyMainDevice(this.cachedMainDeviceNotifications.shift());
    }
  }

  setNearby(nearby) {
    this._nearby = nearby;

    log.cyan('Nearby aspect ready');

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

    nearby.on('proxy_apn_notification', ({ originDevice, obj }) => {
      if (this.device.id == originDevice) {
        return;
      }

      if (this.isPrimaryLanServer()) {
        log.cyan('Primary lanServer — received proxy_apn_notification:');
        log.gray(obj);
        const { msg, users } = obj;
        apn.notify(msg, { users, originDevice });
      }
    });

    nearby.on('proxy_push_notification', ({ originDevice, obj }) => {
      if (this.device.id == originDevice) {
        return;
      }

      if (this.isPrimaryLanServer()) {
        log.cyan('Primary lanServer — received proxy_push_notification:');
        log.gray(obj);
        push.notifyRaw(this, obj.msg, { ...obj.obj, originDevice });
      }
    });
  }

  nearby() {
    return this._nearby;
  }

  periodicNotification(checkCallback, executeCallback) {
    const CHECK_INTERVAL = 5 * 60 * 1000;
    const STANDOFF_INTERVAL = 90 * 60 * 1000;

    let reportedAt;

    setTimeout(() => {
      dmt.loop(() => {
        if (checkCallback(this) && (!reportedAt || Date.now() - reportedAt >= STANDOFF_INTERVAL)) {
          executeCallback(this);

          reportedAt = Date.now();
        }
      }, CHECK_INTERVAL);
    }, 2 * CHECK_INTERVAL);
  }
}

export default (...args) => {
  return new Program(...args);
};
