import colors from 'colors';

import { printServerInfo } from '../exampleUtils';

import { newKeypair, Server } from '../../index';
import { bufferToHex } from '../../lib/utils';

import wsEndpoint from './serverEndpoint';

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
  console.log(colors.magenta(`Shared secret: ${colors.gray(bufferToHex(channel.sharedSecret))}`));
});

server.on('connection_closed', channel => {
  console.log(colors.magenta(`Connection ${colors.gray(bufferToHex(channel.sharedSecret))} closed`));
});

server.start();
