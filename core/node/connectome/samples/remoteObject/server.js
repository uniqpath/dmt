import colors from 'colors';

import { printServerInfo } from '../exampleUtils.js';

import { newKeypair, Server } from '../../index.js';
import { bufferToHex } from '../../lib/utils/index.js';

import wsEndpoint from './serverEndpoint.js';

const keypair = newKeypair();

const { privateKeyHex, publicKeyHex } = keypair;

printServerInfo({ privateKeyHex, publicKeyHex });

const port = 3500;
const protocol = 'test';
const protocolLane = 'fiber';

const verbose = false;

const server = new Server({ port, keypair, verbose });

server.addWsEndpoint({ protocol, protocolLane, wsEndpoint });

server.on('connection', channel => {
  console.log(colors.magenta(`Initiated new connection with shared secret ${colors.gray(bufferToHex(channel.sharedSecret))}`));
});

server.on('connection_closed', channel => {
  console.log(`Connection ${colors.gray(bufferToHex(channel.sharedSecret))} closed`);
});

server.start();
