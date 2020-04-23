import colors from 'colors';

import { printClientInfo } from '../exampleUtils';

import { connect, newKeypair } from '../../index';

const address = 'localhost';

const port = 3500;
const protocol = 'test';
const protocolLane = 'fiber';
const verbose = false;

const { privateKey: clientPrivateKey, publicKey: clientPublicKey, privateKeyHex, publicKeyHex } = newKeypair();

printClientInfo({ privateKeyHex, publicKeyHex });

let receivedCount = 0;

connect({ address, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, remotePubkey: undefined, verbose }).then(connector => {
  connector.on('connected', ({ sharedSecretHex }) => {
    console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
    console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));
  });

  connector.on('disconnected', () => {
    console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
  });

  connector.on('wire_receive', ({ jsonData }) => {
    console.log(jsonData);
    receivedCount += 1;
    if (receivedCount == 3) {
      console.log(`${colors.gray("Received 3 messages, let's disconnect now ...")}`);
      process.exit();
    }
  });
});
