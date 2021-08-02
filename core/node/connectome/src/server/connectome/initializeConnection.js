import AuthTarget from './rpcTargets/authTarget.js';

function initializeConnection({ server, channel }) {
  server.emit('prepare_channel', channel);

  const auth = new AuthTarget({ keypair: server.keypair, channel, server });
  channel.attachObject('Auth', auth);
}

export default initializeConnection;
