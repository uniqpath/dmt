import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { hexToBuffer } from '../../index.js';

nacl.util = naclutil;

function acceptKeypair(keypair) {
  if (keypair.publicKeyHex && !keypair.publicKey) {
    keypair.publicKey = hexToBuffer(keypair.publicKeyHex);
  }

  if (keypair.privateKeyHex && !keypair.privateKey) {
    keypair.privateKey = hexToBuffer(keypair.privateKeyHex);
  }

  return keypair;
}

export default acceptKeypair;
