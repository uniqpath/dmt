import colors from 'kleur';

import { printClientInfo } from '../exampleUtils.js';

import { connect, newClientKeypair } from '../../../src/client/index.js';

const address = 'localhost';

const port = 3500;
const protocol = 'test';
const verbose = false;

const keypair = newClientKeypair();
const { privateKeyHex, publicKeyHex } = keypair;

printClientInfo({ privateKeyHex, publicKeyHex });

let receivedCount = 0;

const connector = connect({ address, port, protocol, keypair, remotePubkey: undefined, verbose });

connector.on('ready', () => {
  console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
  console.log(colors.magenta(`Shared secret: ${colors.gray(connector.getSharedSecret())}`));
});

connector.on('disconnect', () => {
  console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
});

connector.on('receive', ({ jsonData }) => {
  console.log(jsonData);
  receivedCount += 1;
  if (receivedCount == 3) {
    console.log(`${colors.gray('Received 3/3 messages, disconnecting ...')}`);
    process.exit();
  }
});
