import colors from 'colors';

import { printClientInfo } from '../exampleUtils.js';

import { connect, newKeypair } from '../../../index.js';

const address = 'localhost';

const port = 3500;
const protocol = 'test';
const protocolLane = 'fiber';

const verbose = false;

const keypair = newKeypair();
const { privateKeyHex, publicKeyHex } = keypair;

printClientInfo({ privateKeyHex, publicKeyHex });

const connector = connect({ address, port, protocol, protocolLane, keypair, remotePubkey: undefined, verbose });

connector.on('ready', ({ sharedSecretHex }) => {
  console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
  console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));

  const object = colors.green('ServerObject::hello');
  console.log(`Calling remote object method: ${object}`);

  connector
    .remoteObject('ErrorObject')
    .call('makeError')
    .then(response => {
      console.log(`Received response from ${object} → ${colors.yellow(response)}`);
      process.exit();
    })
    .catch(e => {
      console.log('Error:');
      console.log(colors.red(e));
    });
});

connector.on('disconnect', () => {
  console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
});
