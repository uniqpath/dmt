// methods defined in this file
//⚠️ ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// this is a duplicate

async function loadModule(whichUtil) {
  return import(`./${whichUtil}`);
}

function log(msg) {
  console.log(`${new Date().toLocaleString()} → ${msg}`);
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function isNodeJs() {
  return !isBrowser();
}

function listify(obj) {
  if (typeof obj == 'undefined' || obj == null) {
    return [];
  }
  return Array.isArray(obj) ? obj : [obj];
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g); // split by two, https://blog.abelotech.com/posts/split-string-tokens-defined-length-javascript/
  return new Uint8Array(tokens.map(token => parseInt(token, 16)));
}

// source: https://stackoverflow.com/a/12965194/458177
// good only up to 2**53 (JavaScript Integer range) -- usually this is plenty ...
function integerToByteArray(/*long*/ long, arrayLen = 8) {
  // we want to represent the input as a 8-bytes array
  const byteArray = new Array(arrayLen).fill(0);

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return byteArray;
}

export {
  // tool
  loadModule,
  // methods defined in this file:
  log,
  isBrowser,
  isNodeJs,
  listify,
  bufferToHex,
  hexToBuffer,
  integerToByteArray
};
