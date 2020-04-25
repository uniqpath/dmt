import dmt from 'dmt/bridge';

const { bufferToHex } = dmt.util.hexutils;

import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
nacl.util = util;

function generate() {
  const keys = nacl.box.keyPair();

  const publicKey = bufferToHex(keys.publicKey);
  const privateKey = bufferToHex(keys.secretKey);

  return { publicKey, privateKey };
}

export default generate;
