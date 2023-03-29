import EventEmitter from 'events';

import * as dmt from 'dmt/common';
const { log, colors, colors2, dateFns } = dmt;

const { format, addMinutes, isBefore } = dateFns;

import { desktop, apn, push } from 'dmt/notify';

import initControllerActor from '../apiController/index.js';
import initDeviceActor from '../apiDevice/index.js';
import ActorManagement from './actorManagement/index.js';

import startTicker from './interval/startTicker.js';
import { setupTimeUpdater } from './interval/timeUpdater.js';
import onProgramTick from './interval/onProgramTick.js';
import onProgramSlowTick from './interval/onProgramSlowTick.js';

import createFiberPool from './peerlist/createFiberPool.js';
import syncPeersToProgramState from './peerlist/syncPeersToProgramState.js';

import Network from '../network/index.js';
import ProgramConnectionsAcceptor from './connectionsAcceptor.js';

import ensureDirectories from './boot/ensureDirectories.js';
import preventMultipleMainDevices from './boot/preventMultipleMainDevices.js';
import preventMultipleMainServers from './boot/preventMultipleMainServers.js';
import getDeviceInfo from './boot/getDeviceInfo.js';

import createProgramStore from './createStore/createProgramStore.js';
import { createStore, getStore } from './createStore/createStore.js';

import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler.js';
import loadMiddleware from './boot/loadMiddleware.js';
import osUptime from './interval/osUptime.js';

import generateKeypair from './generateKeypair.js';
import exceptionNotify from './errors/exceptionNotify.js';
import ipcServer from './ipcServer/ipcServer.js';
import ipcServerLegacy from './ipcServer/ipcServerLegacy.js';

import load from './load.js';

class Program extends EventEmitter {
  constructor({ mids, fromABC }) {
    super();

    this.mqttHandlers = [];

    this.cachedNearbyNotifications = [];
    this.cachedMainDeviceNotifications = [];

    ensureDirectories();

    generateKeypair();

    preventMultipleMainDevices();
    preventMultipleMainServers();

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.fromABC = fromABC;

    this.notifiers = [];

    this.network = new Network(this);

    this._programStore = createProgramStore(this);

    setupGlobalErrorHandler(this);

    this.on('ready', () => {
      if (!dmt.isMainDevice()) {
        this.nearbyNotification({ msg: 'dmt-proc started', ttl: 10, color: '#50887E', dev: true });
      }

      if (fromABC) {
        setTimeout(() => {
          log.yellow(`🛑 ${colors.cyan('dmt-proc')} started by ABC after crash`);
          push
            .optionalApp('dmt_errors')
            .omitAppName()
            .notify('✅ dmt-proc resumed but the cause for crash still has to be fixed');
        }, 2000);
      }

      this.sendCachedNearbyNotifications();
      this.sendCachedMainDeviceNotifications();
    });

    log.green(`${colors.cyan('dmt-proc')} is starting ${this.runningInTerminalForeground() ? colors.magenta('in terminal foreground ') : ''}…`);

    osUptime(this);

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
      this.slot('connectionsOut').set(connectionList);
    });

    const emitter = new EventEmitter();

    emitter.on('file_request', data => {
      this.emit('file_request', data);
    });
    syncPeersToProgramState({ program: this, connectorPool: this.fiberPool, port });

    this.actors = new ActorManagement(this);
    this.acceptor = new ProgramConnectionsAcceptor(this);

    const onConnect = ({ program, channel }) => {
      channel.attachObject('dmt', {
        version: () => dmt.dmtVersion()
      });

      this.actors.setupChannel(channel);
    };

    this.dev('dmt').registerProtocol(undefined, onConnect);

    if (dmt.isRPi()) {
      this.slot('device').update({ isRPi: true }, { announce: false });
    } else {
      this.slot('device').removeKey('isRPi', { announce: false });
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

  wasSpawnedByABC() {
    return this.fromABC;
  }

  runningInTerminalForeground() {
    return log.isForeground();
  }

  exceptionNotify(msg, { origin, delay, exitProcess = false } = {}) {
    if (origin) {
      msg = `${origin} - check log for details, not restarting dmt-proc\n\n${msg}`;
    }

    return exceptionNotify(msg, { delay, exitProcess, program: this });
  }

  api(name) {
    return this.actors.get(name);
  }

  registerApi(actor, options = {}) {
    log.cyan(`Registered Program API — ${colors.magenta(actor.apiName)}`);
    this.actors.register(actor, options);
  }

  registeredApis() {
    return this.actors.registeredActors();
  }

  peerlist() {
    const peerlist = this.slot('peerlist').get();

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
    initDeviceActor(this);

    setTimeout(() => {
      this.acceptor.start();
    }, 200);

    ipcServer(this);
    ipcServerLegacy(this);

    log.green('Started IPC server');

    this.on('ready', () => {
      log.green(`✓ ${colors.cyan('dmt-proc')} ${colors.bold().white(`v${dmt.dmtVersion()}`)} ${colors.cyan('ready')}`);

      startTicker(this);

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
    if (dmt.user().country) {
      return dmt.user().country;
    }

    if (this.network) {
      return this.network.country();
    }
  }

  lang() {
    return dmt.user().language || 'eng';
  }

  loadDirectory(dir, filter) {
    load(this, dir, filter);
  }

  loadDirectoryRecursive(dir, filter) {
    load(this, dir, filter, true);
  }

  registerNotifier(notifier) {
    this.notifiers.push(notifier);
  }

  decommissionNotifiers() {
    for (const n of this.notifiers) {
      n.decommission();
    }

    this.notifiers = [];
  }

  isHub() {
    if (!dmt.apMode()) {
      const definedIp = this.device.try('network.ip');
      const assignedIp = this.slot('device').get('ip');

      const { accessPointIP } = dmt;

      return (!assignedIp && definedIp == accessPointIP) || assignedIp == accessPointIP;
    }
  }

  getPrimaryLanServer() {
    const lanServers = this.slot('nearbyDevices')
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
    return !!this.slot('nearbyDevices')
      .get()
      .find(({ lanServer, stale, thisDevice, ip }) => lanServer && !thisDevice && !stale && dmt.isValidIPv4Address(ip) && !dmt.disconnectedIPAddress(ip));
  }

  hasGui() {
    return this.device.try('service[gui].disable') != 'true';
  }

  hasValidIP() {
    const { ip } = this.slot('device').get();
    if (ip && !dmt.disconnectedIPAddress(ip)) {
      return true;
    }
  }

  constructOldProtocolHandle(dmtID, protocol) {
    return protocol ? `${dmtID}/${protocol}` : dmtID;
  }

  dev(dmtID) {
    return this.developer(dmtID);
  }

  developer(dmtID) {
    const { connectome } = this.acceptor;

    return {
      registerProtocol: (protocol, onConnect = () => {}) => {
        const onConnectWrap = ({ channel }) => {
          onConnect({ program: this, channel });
        };

        return connectome.dev(dmtID).registerProtocol(protocol, onConnectWrap);
      },

      protocol: _protocol => {
        const handle = this.constructOldProtocolHandle(dmtID, _protocol);

        const store = () => getStore(handle);
        const slot = slotName => getStore(handle).slot(slotName);

        const p = connectome.dev(dmtID).protocol(_protocol);

        const onUserAction = p.onUserAction.bind(connectome);
        const scope = p.scope.bind(connectome);

        return { onUserAction, scope, createStore: (...args) => createStore(handle, ...args), store, slot };
      }
    };
  }

  slot(slotName) {
    return this._programStore.slot(slotName);
  }

  store() {
    return this._programStore;
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
    return dmt.isDevPanel() || dmt.isMainDevice() || dmt.apMode();
  }

  clearNearbyNotification(group) {
    this.nearbyNotification({ group, clearNotification: true });
  }

  showNotification(
    {
      title,
      msg,
      tagline = null,
      ttl = 30,
      color = '#FFFFFF',
      group,
      omitDeviceName = false,
      omitDesktopNotification = false,
      omitTtl = false,
      clearNotification = false,
      dev = false
    },
    { originDevice = undefined, onlyMain = undefined } = {}
  ) {
    if (dev && !this.showDevNotifications()) {
      return;
    }

    const bgColor = color;

    const id = Math.random();

    let recommendedTitle;

    if (title) {
      recommendedTitle = originDevice && !omitDeviceName ? `${originDevice} · ${title}` : title;
    } else if (originDevice) {
      if (!omitDeviceName) {
        recommendedTitle = originDevice;
      }
    } else if (!omitDeviceName) {
      recommendedTitle = this.device.id;
    }

    this.slot('notifications').removeArrayElements(
      n => {
        return group && n.group == group;
      },
      { announce: clearNotification }
    );

    if (!clearNotification) {
      const notification = {
        __id: id,
        title: onlyMain ? `${recommendedTitle} [MAIN]` : dev ? `${recommendedTitle} [DΞV]` : recommendedTitle,
        msg,
        bgColor,
        color: colors2.invertColor(bgColor),
        group,
        omitTtl,
        tagline,
        expireAt: Date.now() + ttl * 1000,
        addedAt: Date.now()
      };

      this.slot('notifications').push(notification);

      if (dmt.isDevUser() && this.isPrimaryLanServer()) {
        const obj = { title, msg, group, dev, originDevice };
        Object.keys(obj).forEach(key => {
          if (obj[key] === undefined) {
            delete obj[key];
          }
        });
        if (!obj.dev) {
          delete obj.dev;
        }

        log.cyan(`GUI notification → ${colors.bold().white(JSON.stringify(obj, null, 2))}`);
      }

      if (dmt.isPersonalComputer() && !omitDesktopNotification) {
        let _msg;

        if (tagline && msg) {
          _msg = `${tagline}\n\n${msg}`;
        } else if (tagline) {
          _msg = tagline;
        } else {
          _msg = msg || '';
        }

        desktop.notify(_msg || '[ missing message ]', `${recommendedTitle || this.network.name() || this.device.id}`.trim());
      }
    }
  }

  nearbyNotification(obj) {
    const { dev, device, devices } = obj;
    const _devices = Array(device || devices || []).flat();

    if (dev && !dmt.isDevUser()) {
      return;
    }

    if (this._nearby) {
      if (!dev || (dev && this.showDevNotifications())) {
        if (_devices.length == 0 || _devices.includes(this.device.id)) {
          this.showNotification(obj);
        }
      }

      this._nearby.send('notification', obj);
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
      this._nearby.send('notify_main_device', obj);
    } else {
      this.cachedMainDeviceNotifications.push(obj);
    }
  }

  nearbyProxyApnMsgViaLanServer(obj) {
    if (this._nearby) {
      this._nearby.send('proxy_apn_notification', obj);
    } else {
      throw new Error('Too early, todo: cache');
    }
  }

  nearbyProxyPushMsgViaLanServer(obj) {
    if (this._nearby) {
      this._nearby.send('proxy_push_notification', obj);
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

      const { device, devices } = obj;
      const _devices = Array(device || devices || []).flat();
      if (_devices.length == 0 || _devices.includes(this.device.id)) {
        this.showNotification(obj, { originDevice });
      }
    });

    nearby.on('notify_main_device', ({ originDevice, obj }) => {
      if (this.device.id == originDevice) {
        return;
      }

      if (dmt.isMainDevice()) {
        this.showNotification(obj, { originDevice, onlyMain: true });
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
        log.white(`Received proxy_push_notification from ${colors.cyan(originDevice)}:`);
        push.notifyRaw({ ...obj, originDevice });
      }
    });
  }

  nearby() {
    return this._nearby;
  }
}

export default (...args) => {
  return dmt.setProgram(new Program(...args));
};
