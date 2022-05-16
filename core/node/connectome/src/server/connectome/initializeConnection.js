import AuthTarget from './rpcTargets/authTarget.js';

function initializeConnection({ server, channel }) {
  const auth = new AuthTarget({ keypair: server.keypair, channel, server });
  channel.attachObject('Auth', auth);
}

export default initializeConnection;
