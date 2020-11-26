import { EventEmitter } from '../utils/index.js';
import WsServer from './wsServer.js';
import initializeConnection from './initializeConnection.js';

import { compareValues } from '../utils/sorting/sorting.js';

import ChannelList from '../channel/channelList.js';

class ConnectionsAcceptor extends EventEmitter {
  constructor({ ssl = false, port, keypair, verbose }) {
    super();

    this.ssl = ssl;
    this.port = port;
    this.keypair = keypair;
    this.verbose = verbose;

    this.protocols = {};
  }

  registerProtocol({ protocol, lane, onConnect = () => {} }) {
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
    this.wsServer = new WsServer({ ssl: this.ssl, port: this.port, verbose: this.verbose });

    this.wsServer.on('connection', channel => initializeConnection({ server: this, channel }));
    this.wsServer.on('connection_closed', channel => this.emit('connection_closed', channel));
  }

  registeredProtocols() {
    return Object.entries(this.protocols).map(([protocol, lanes]) => {
      return { protocol, lanes: Object.keys(lanes) };
    });
  }

  connectionList() {
    const list = this.wsServer.enumerateConnections().reverse();
    const order = compareValues('protocol', 'lane');
    return list.sort(order);
  }
}

export default ConnectionsAcceptor;
