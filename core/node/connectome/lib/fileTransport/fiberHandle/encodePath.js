import { isNodeJs, bufferToHex, hexToBuffer } from '../../utils/index.js';

function encode(text) {
  return isNodeJs() && bufferToHex(Buffer.from(text, 'utf-8'));
}

function decode(hexStr) {
  return isNodeJs() && Buffer.from(hexToBuffer(hexStr)).toString();
}

export { encode, decode };
