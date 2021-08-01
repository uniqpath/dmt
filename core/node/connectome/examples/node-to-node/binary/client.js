import colors from 'colors';

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

connector.on('ready', ({ sharedSecretHex }) => {
  console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
  console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));
});

connector.on('disconnect', () => {
  console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
});

connector.on('receive_binary', data => {
  console.log(data);
  receivedCount += 1;
  if (receivedCount == 3) {
    console.log(`${colors.gray('Received 3/3 messages, now sending ours ...')}`);
    const msg = new Uint8Array([3, 4, 5, 6, 7]);
    connector.send(msg);
    connector.send(msg);
    connector.send(msg);
  }
});
