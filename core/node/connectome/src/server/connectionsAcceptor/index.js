import WsServer from './wsServer.js';
import initializeConnection from './initializeConnection.js';

import ReadableStore from '../../stores/front/helperStores/readableStore.js';

import { orderBy } from '../../utils/sorting/sorting.js';

import ChannelList from '../channel/channelList.js';

class ConnectionsAcceptor extends ReadableStore {
  constructor({ port, keypair, server, verbose }) {
    super({ connectionList: [] });

    this.port = port;
    this.keypair = keypair;

    this.server = server;

    this.verbose = verbose;

    this.protocols = {};
  }

  registerProtocol({ protocol, lane, onConnect }) {
    if (this.wsServer) {
      throw new Error('registerProtocol: Please add all protocols before starting the ws server.');
    }

    this.emit('protocol_added', { protocol, lane });

    if (!this.protocols[protocol]) {
      this.protocols[protocol] = {};
    }

    if (!this.protocols[protocol][lane]) {
      const channelList = new ChannelList({ protocol, lane });
      this.protocols[protocol][lane] = { onConnect, channelList };
      return channelList;
    }

    throw new Error(`Protocol lane ${protocol}/${lane} already exists`);
  }

  start() {
    this.wsServer = new WsServer({
      port: this.port,
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
    return Object.entries(this.protocols).map(([protocol, lanes]) => {
      return { protocol, lanes: Object.keys(lanes) };
    });
  }

  connectionList() {
    const list = this.wsServer.enumerateConnections().reverse();
    const order = orderBy('protocol', 'lane');
    return list.sort(order);
  }
}

export default ConnectionsAcceptor;
