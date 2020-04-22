import colors from 'colors';

import { connect, newKeypair } from '../index';

const address = 'localhost';
const port = 3500;
const protocol = 'quantum';
const protocolLane = 'generator';
const { privateKey, publicKey, privateKeyHex, publicKeyHex } = newKeypair();

console.log(colors.green('Client'));
console.log(colors.green('------'));
console.log();
console.log(colors.magenta('Generated session keypair:'));
console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
console.log();

const SIMPLE = false;

connect({ address, port, protocol, protocolLane, clientPrivateKey: privateKey, clientPublicKey: publicKey, remotePubkey: undefined, verbose: 'extra' }).then(
  connector => {
    if (!SIMPLE) {
      connector.registerRemoteObject('ClientTestObject', { hello: () => 'CLIENT WORLD' });
      connector.registerRemoteObject('WisdomReceiver', { wisdom: msg => console.log(`Received quantum wisdom: ${colors.green(msg)}`) });
    }

    connector.on('connected', ({ sharedSecretHex }) => {
      console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
      console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));

      if (!SIMPLE) {
        connector
          .remoteObject('ServerTestObject')
          .call('hello')
          .then(result => {
            console.log(`Received HELLO result from server: ${result}`);
          })
          .catch(console.log);
      }
    });

    connector.on('disconnected', () => {
      console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
    });

    connector.on('wire_receive', ({ jsonData }) => {
      console.log(jsonData);
    });
  }
);
