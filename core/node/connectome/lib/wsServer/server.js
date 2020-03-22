import EventEmitter from '../emitter';
import ServerInstance from './serverInstance';

import AuthTarget from './authTarget';

import ChannelList from '../wsChannel/channelList';

class Server extends EventEmitter {
  constructor({ port, keypair, verbose }) {
    super();

    this.port = port;
    this.keypair = keypair;
    this.verbose = verbose;

    this.protocols = {};
  }

  start() {
    for (const protocol of Object.keys(this.protocols)) {
      for (const lane of Object.keys(this.protocols[protocol])) {
        this.emit('protocol_added', { protocol, lane });
      }
    }

    this.server = new ServerInstance({ port: this.port, verbose: this.verbose });

    this.server.on('connection_closed', channel => this.emit('connection_closed', channel));

    this.server.on('connection', channel => this.initializeConnection({ channel }));
  }

  addWsEndpoint({ protocol, lane, wsEndpoint }) {
    if (this.server) {
      throw new Error('Please make user to add all protocols before starting ws server.');
    }

    this.emit('protocol_added', { protocol, lane });

    if (!this.protocols[protocol]) {
      this.protocols[protocol] = {};
    }

    if (!this.protocols[protocol][lane]) {
      const channelList = new ChannelList({ protocol, lane });
      this.protocols[protocol][lane] = { wsEndpoint, channelList };
      return channelList;
    }

    throw new Error(`Protocol lane ${protocol}/${lane} already exists`);
  }

  initializeConnection({ channel }) {
    this.emit('prepare_channel', channel);

    const auth = new AuthTarget({ keypair: this.keypair });

    channel.registerRemoteObject('Auth', auth);

    auth.on('shared_secret', ({ sharedSecret, protocolLane }) => {
      channel.setSharedSecret(sharedSecret);
      channel.setLane(protocolLane);

      this.initializeProtocol(channel);

      this.emit('connection', channel);
    });
  }

  initializeProtocol(channel) {
    if (this.protocols[channel.protocol] && this.protocols[channel.protocol][channel.lane]) {
      const { wsEndpoint, channelList } = this.protocols[channel.protocol][channel.lane];
      channelList.add(channel);
      channel.list = channelList;

      wsEndpoint(channel);
    } else {
      console.log(`Error: unknown protocol ${channel.protocol}, lane: ${channel.protocol}, disconnecting`);
      channel.terminate();
    }
  }
}

export default Server;
