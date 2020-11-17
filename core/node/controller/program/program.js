import EventEmitter from 'events';
import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

import { push } from 'dmt/notify';

import { ConnectorPool, contentServer } from 'dmt/connectome';

import initControllerActor from '../actor';
import ActorManagement from './actorManagement/index.js';

import MetaMaskStore from './metamask';

import initIntervalTicker from './interval';
import { setupTimeUpdater } from './interval/timeUpdater';
import onProgramTick from './interval/onProgramTick';

import Network from '../network';
import Server from '../server/mainHttpServer';
import ProgramConnectionsAcceptor from '../server/programConnectionsAcceptor';

import ensureDirectories from './boot/ensureDirectories';
import getDeviceInfo from './boot/getDeviceInfo';
import createProgramStore from './createProgramStore/index.js';
import setupGlobalErrorHandler from './boot/setupGlobalErrorHandler';
import loadMiddleware from './boot/loadMiddleware';

import generateKeypair from './generateKeypair';
import ipcServer from './ipcServer/ipcServer';
import loadUserProtocols from './userProtocols/loadUserProtocols';

class Program extends EventEmitter {
  constructor({ mids }) {
    super();

    ensureDirectories();

    this.sideStore = {};

    this.log = dmt.log;
    this.device = getDeviceInfo();

    this.network = new Network(this);
    this.server = new Server(this);
    this.store = createProgramStore(this);

    setupGlobalErrorHandler();

    log.cyan('Program booting ...');

    generateKeypair();

    this.metamaskStore = new MetaMaskStore();

    this.actors = new ActorManagement(this);

    this.acceptor = new ProgramConnectionsAcceptor(this);

    this.setupConnectorPool();

    if (dmt.isRPi()) {
      this.store.update({ device: { isRPi: true } }, { announce: false });
    } else if (this.state().device) {
      delete this.state().device.isRPi;
    }

    loadUserProtocols(this);

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

  updatePeerlist(peerlist) {
    this._peerlist = peerlist;
  }

  peerlist() {
    return this._peerlist;
  }

  logSearch(msg) {
    if (this.device.try('search.log') == 'true') {
      log.green(`ZetaSeek: ${msg}`);
    }
  }

  metamask() {
    return this.metamaskStore;
  }

  registerActor(actor, options = {}) {
    this.actors.register(actor, options);
  }

  actor(name) {
    return this.actors.get(name);
  }

  registerProtocol({ protocol, protocolLane, onConnect }) {
    const onConnectWrap = ({ channel }) => onConnect({ program: this, channel });
    return this.acceptor.registerProtocol({ protocol, protocolLane, onConnect: onConnectWrap });
  }

  setupConnectorPool() {
    const port = 7780;
    const protocol = 'dmt';
    const protocolLane = 'fiber';

    const onConnect = ({ program, channel }) => program.actors.setupChannel(channel);
    this.registerProtocol({ protocol, protocolLane, onConnect });

    const keypair = dmt.keypair();
    if (!keypair) {
      log.red('Missing keypair, not preparing fiber pool...');
      return;
    }

    const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = keypair;

    this.connectorPool = new ConnectorPool({ protocol, protocolLane, port, clientPrivateKey, clientPublicKey, log: log.write });

    const emitter = new EventEmitter();

    emitter.on('file_request', data => {
      this.emit('file_request', data);
    });

    this.server.setupRoutes(app => contentServer({ app, connectorPool: this.connectorPool, defaultPort: port, emitter }));
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
