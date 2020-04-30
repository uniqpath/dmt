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

connect({ address, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, remotePubkey: undefined, verbose }).then(connector => {
  connector.registerRemoteObject('ErrorObject', {
    makeError: () => {
      throw new Error('ERROR IS THROWN');
    }
  });

  connector.on('connected', ({ sharedSecretHex }) => {
    console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
    console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));
  });

  connector.on('disconnected', () => {
    console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
  });
});
