const colors = require('chalk');
const { newKeypair } = require('./crypto/index.js');
const { stores } = require('./stores/index.js');
const { ConnectionsAcceptor } = require('./server/index.js');

const store = new stores.ProtocolStore({});

function onConnect({ channel, store }) {
  console.log('New example/gui connection');

  channel.on('action', ({ action, namespace, payload }) => {
    if (namespace == 'svelte' && action == 'set_component') {
      const { compiledComponent } = payload;
      store.set({ compiledComponent });
    }
  });
}

function start({ port }) {
  const keypair = newKeypair();
  const acceptor = new ConnectionsAcceptor({ port, keypair });

  acceptor.on('protocol_added', ({ protocol }) => {
    console.log(`💡 Connectome protocol ${colors.cyan(protocol)} ready.`);
  });

  const protocol = 'example';

  const channels = acceptor.registerProtocol({
    protocol,
    onConnect: ({ channel }) => onConnect({ channel, store })
  });

  store.sync(channels);

  acceptor.start();
  console.log(colors.green(`Connectome → Running websocket connections acceptor on port ${port} ...`));
}

start({ port: 9000 });
