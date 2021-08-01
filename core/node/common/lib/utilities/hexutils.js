export { bufferToHex, hexToBuffer };

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g);
  return new Uint8Array(tokens.map(token => parseInt(token, 16)));
}
