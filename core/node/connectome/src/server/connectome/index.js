import WsServer from './wsServer.js';
import initializeConnection from './initializeConnection.js';

import ReadableStore from '../../stores/lib/helperStores/readableStore.js';

import { orderBy } from '../../utils/sorting/sorting.js';

import ChannelList from '../channel/channelList.js';

import { newKeypair } from '../../utils/crypto/index.js';

export default class Connectome extends ReadableStore {
  constructor({ port, keypair = newKeypair(), server, log = console.log, verbose }) {
    super({ connectionList: [] });

    this.port = port;
    this.keypair = keypair;

    this.server = server;

    this.log = log;
    this.verbose = verbose;

    this.protocols = {};
  }

  registerProtocol({ protocol, onConnect = () => {} }) {
    if (this.wsServer) {
      throw new Error('registerProtocol: Please add all protocols before starting the ws server.');
    }

    this.emit('protocol_added', { protocol });

    if (!this.protocols[protocol]) {
      const channelList = new ChannelList({ protocol });
      this.protocols[protocol] = { onConnect, channelList };
      return channelList;
    }

    throw new Error(`Protocol ${protocol} already exists`);
  }

  start() {
    this.wsServer = new WsServer({
      port: this.port,
      log: this.log,
      verbose: this.verbose,
      server: this.server
    });

    this.wsServer.on('connection', channel => {
      initializeConnection({ server: this, channel });
    });

    this.on('connection', () => {
      this.publishState();
    });

    this.wsServer.on('connection_closed', channel => {
      this.emit('connection_closed', channel);
      this.publishState();
    });
  }

  publishState() {
    const connectionList = this.connectionList();

    connectionList.forEach(connection => {
      delete connection.lastMessageAt;
      delete connection.readyState;
    });

    this.state = { connectionList };
    this.announceStateChange();
  }

  registeredProtocols() {
    return Object.keys(this.protocols);
  }

  connectionList() {
    const list = this.wsServer.enumerateConnections().reverse();
    const order = orderBy('protocol');
    return list.sort(order);
  }
}
