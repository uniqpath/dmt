import EventEmitter from '../emitter';
import ServerInstance from './serverInstance';

import AuthTarget from './authTarget';

class Server extends EventEmitter {
  constructor({ port, keypair, protocols = {} }) {
    super();

    this.port = port;
    this.keypair = keypair;
    this.protocols = protocols;
  }

  start() {
    for (const protocol of Object.keys(this.protocols)) {
      this.emit('protocol_added', protocol);
    }

    this.server = new ServerInstance({ port: this.port });

    this.server.on('connection_closed', channel => this.emit('connection_closed', channel));

    this.server.on('connection', channel => this.initializeConnection({ channel }));
  }

  addProtocol(protocol, wsEndpoint) {
    if (this.server) {
      throw new Error('Please make user to add all protocols before starting ws server.');
    }

    this.emit('protocol_added', protocol);

    if (!this.protocols[protocol]) {
      this.protocols[protocol] = wsEndpoint;
    } else {
      throw new Error(`Protocol ${protocol} already exists`);
    }
  }

  initializeConnection({ channel }) {
    this.emit('prepare_channel', channel);

    const auth = new AuthTarget({ keypair: this.keypair });

    channel.registerRemoteObject('Auth', auth);

    auth.on('shared_secret', sharedSecret => {
      channel.setSharedSecret(sharedSecret);
      this.initializeProtocol(channel);

      this.emit('connection', channel);
    });
  }

  initializeProtocol(channel) {
    const protocolEndpoint = this.protocols[channel.protocol];

    if (protocolEndpoint) {
      protocolEndpoint(channel);
    } else {
      console.log(`Error: unknown protocol ${channel.protocol}, disconnecting`);
      channel.terminate();
    }
  }
}

export default Server;
