import sha256 from './sha256.js';

function textHash(text) {
  return sha256(text);
}

export default textHash;
