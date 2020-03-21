import colors from 'colors';

import { connect, newKeypair } from '../index';

const endpoint = 'ws://localhost:3500';
const protocol = 'quantum';
const { privateKey, publicKey, privateKeyHex, publicKeyHex } = newKeypair();

console.log(colors.green('Client'));
console.log(colors.green('------'));
console.log();
console.log(colors.magenta('Generated session keypair:'));
console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
console.log();

connect({ endpoint, protocol, clientPrivateKey: privateKey, clientPublicKey: publicKey, remotePubkey: undefined, verbose: 'extra' }).then(connector => {
  connector.registerRemoteObject('ClientTestObject', { hello: () => 'CLIENT WORLD' });
  connector.registerRemoteObject('WisdomReceiver', { wisdom: msg => console.log(`Received quantum wisdom: ${colors.green(msg)}`) });

  connector.on('connected', ({ sharedSecretHex }) => {
    console.log(`${colors.gray('Channel connected')} ${colors.green('✓')}`);
    console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));

    connector
      .remoteObject('ServerTestObject')
      .call('hello')
      .then(result => {
        console.log(`Received HELLO result from server: ${result}`);
      })
      .catch(console.log);
  });

  connector.on('disconnected', () => {
    console.log(`${colors.gray('Channel disconnected')} ${colors.red('✖')}`);
  });

  connector.on('wire_receive', ({ jsonData }) => {
    console.log(jsonData);
  });
});
