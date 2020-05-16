import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { bufferToHex } from './lib/utils';
import connect from './lib/connect/connectNode';
import connectBrowser from './lib/connect/connectBrowser';

import Server from './lib/server/server';

import FiberPool from './lib/fibers/fiberPool';
import contentServer from './lib/fileTransport/contentServer/contentServer';
import * as fiberHandle from './lib/fileTransport/fiberHandle/fiberHandle';

nacl.util = naclutil;

function newKeypair() {
  const keys = nacl.box.keyPair();
  const publicKeyHex = bufferToHex(keys.publicKey);
  const privateKeyHex = bufferToHex(keys.secretKey);

  return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
}

export { connect, connectBrowser, FiberPool, Server, newKeypair, contentServer, fiberHandle };
