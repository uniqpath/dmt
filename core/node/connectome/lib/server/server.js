import { EventEmitter } from '../utils';
import ServerInstance from './serverInstance';

import AuthTarget from './rpcTargets/authTarget';
import HelloTarget from './rpcTargets/helloTarget';

import ChannelList from '../channel/channelList';

class Server extends EventEmitter {
  constructor({ port, keypair, verbose }) {
    super();

    this.port = port;
    this.keypair = keypair;
    this.verbose = verbose;

    this.protocols = {};
  }

  start() {
    this.server = new ServerInstance({ port: this.port, verbose: this.verbose });

    this.server.on('connection', channel => this.initializeConnection({ channel }));
    this.server.on('connection_closed', channel => this.emit('connection_closed', channel));
  }

  addWsEndpoint({ protocol, protocolLane, wsEndpoint }) {
    if (this.server) {
      throw new Error('addWsEndpoint: Please add all protocols before starting the ws server.');
    }

    this.emit('protocol_added', { protocol, protocolLane });

    if (!this.protocols[protocol]) {
      this.protocols[protocol] = {};
    }

    if (!this.protocols[protocol][protocolLane]) {
      const channelList = new ChannelList({ protocol, protocolLane });
      this.protocols[protocol][protocolLane] = { wsEndpoint, channelList };
      return channelList;
    }

    throw new Error(`Protocol lane ${protocol}/${protocolLane} already exists`);
  }

  initializeConnection({ channel }) {
    this.emit('prepare_channel', channel);

    const auth = new AuthTarget({ keypair: this.keypair, channel });
    channel.registerRemoteObject('Auth', auth);

    auth.on('shared_secret', ({ sharedSecret, protocolLane, expectingHelloData }) => {
      channel.setSharedSecret(sharedSecret);
      channel.setProtocolLane(protocolLane);

      if (expectingHelloData) {
        const hello = new HelloTarget({ channel });
        channel.registerRemoteObject('Hello', hello);

        hello.on('done', clientInitData => {
          channel.setClientInitData(clientInitData);

          this.initializeProtocol(channel);
          this.emit('connection', channel);
        });
      } else {
        this.initializeProtocol(channel);
        this.emit('connection', channel);
      }
    });
  }

  initializeProtocol(channel) {
    if (this.protocols[channel.protocol] && this.protocols[channel.protocol][channel.protocolLane]) {
      const { wsEndpoint, channelList } = this.protocols[channel.protocol][channel.protocolLane];
      channelList.add(channel);

      wsEndpoint({ channel, channelList });
    } else {
      console.log(`Error: unknown protocol ${channel.protocol}/${channel.protocolLane}, disconnecting`);
      channel.terminate();
    }
  }
}

export default Server;
