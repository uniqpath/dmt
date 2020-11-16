import { EventEmitter } from '../utils/index.js';
import WsServer from './wsServer.js';
import initializeConnection from './initializeConnection.js';

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

  registerProtocol({ protocol, protocolLane, onConnect }) {
    if (this.wsServer) {
      throw new Error('registerProtocol: Please add all protocols before starting the ws server.');
    }

    this.emit('protocol_added', { protocol, protocolLane });

    if (!this.protocols[protocol]) {
      this.protocols[protocol] = {};
    }

    if (!this.protocols[protocol][protocolLane]) {
      const channelList = new ChannelList({ protocol, protocolLane });
      this.protocols[protocol][protocolLane] = { onConnect, channelList };
      return channelList;
    }

    throw new Error(`Protocol lane ${protocol}/${protocolLane} already exists`);
  }

  start() {
    this.wsServer = new WsServer({ ssl: this.ssl, port: this.port, verbose: this.verbose });

    this.wsServer.on('connection', channel => initializeConnection({ server: this, channel }));
    this.wsServer.on('connection_closed', channel => this.emit('connection_closed', channel));
  }

  registeredProtocols() {
    return Object.entries(this.protocols).map(([protocol, protocolLanes]) => {
      return { protocol, lanes: Object.keys(protocolLanes) };
    });
  }

  connectionList() {
    return this.wsServer.enumerateConnections().reverse();
  }
}

export default ConnectionsAcceptor;
