import AuthTarget from './rpcTargets/authTarget.js';
import initializeProtocol from './initializeProtocol.js';

function initializeConnection({ server, channel }) {
  server.emit('prepare_channel', channel);

  const auth = new AuthTarget({ keypair: server.keypair, channel });
  channel.attachObject('Auth', auth);

  auth.on('shared_secret', ({ sharedSecret, lane }) => {
    channel.setSharedSecret(sharedSecret);
    channel.setLane(lane);

    initializeProtocol({ server, channel });
    server.emit('connection', channel);
  });
}

export default initializeConnection;
