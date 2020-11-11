import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { bufferToHex } from './lib/utils/index.js';
import connect from './lib/connect/connectNode.js';
import connectBrowser from './lib/connect/connectBrowser.js';

import ConnectionsAcceptor from './lib/connectionsAcceptor/index.js';

import FiberPool from './lib/fibers/fiberPool.js';
import contentServer from './lib/fileTransport/contentServer/contentServer.js';
import * as fiberHandle from './lib/fileTransport/fiberHandle/fiberHandle.js';
import * as concurrency from './lib/concurrency/index.js';
import * as stores from './lib/stores/index.js';

nacl.util = naclutil;

function newKeypair() {
  const keys = nacl.box.keyPair();
  const publicKeyHex = bufferToHex(keys.publicKey);
  const privateKeyHex = bufferToHex(keys.secretKey);

  return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
}

export { connect, connectBrowser, FiberPool, ConnectionsAcceptor, newKeypair, contentServer, fiberHandle, concurrency, stores };
