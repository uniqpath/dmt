import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import util from './lib/util';
import connect from './lib/connect/connectNode';
import connectBrowser from './lib/connect/connectBrowser';

import Fanout from './lib/graph/fanout';

import Server from './lib/wsServer/server';

nacl.util = naclutil;

const { bufferToHex } = util;

function newKeypair() {
  const keys = nacl.box.keyPair();
  const publicKeyHex = bufferToHex(keys.publicKey);
  const privateKeyHex = bufferToHex(keys.secretKey);

  return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
}

export { connect, connectBrowser, Server, newKeypair, Fanout };
