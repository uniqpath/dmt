import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { bufferToHex } from '../../index.js';

nacl.util = naclutil;

function newKeypair() {
  const keys = nacl.box.keyPair();
  const publicKeyHex = bufferToHex(keys.publicKey);
  const privateKeyHex = bufferToHex(keys.secretKey);

  return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
}

export default newKeypair;
