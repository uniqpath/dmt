import colors from 'colors';

import { newServerKeypair, ConnectionsAcceptor } from '../../../src/server';
import { printServerInfo } from '../exampleUtils.js';
import { bufferToHex } from '../../../src/utils/index.js';

import onConnect from './serverEndpoint.js';

const keypair = newServerKeypair();

const { privateKeyHex, publicKeyHex } = keypair;

printServerInfo({ privateKeyHex, publicKeyHex });

const port = 3500;
const protocol = 'test';

const verbose = false;

const acceptor = new ConnectionsAcceptor({ port, keypair, verbose });

acceptor.registerProtocol({ protocol, onConnect });

acceptor.on('connection', channel => {
  console.log(colors.magenta(`Initiated new connection with shared secret ${colors.gray(bufferToHex(channel.sharedSecret))}`));
});

acceptor.on('connection_closed', channel => {
  console.log(`Connection ${colors.gray(bufferToHex(channel.sharedSecret))} closed`);
});

acceptor.start();
