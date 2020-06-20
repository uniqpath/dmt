import stopwatch from './stopwatch/stopwatch';
import EventEmitter from './emitter';

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
  const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g);
  return new Uint8Array(tokens.map(token => parseInt(token, 16)));
}

function integerToByteArray(long, arrayLen = 8) {
  const byteArray = new Array(arrayLen).fill(0);

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return byteArray;
}

export { stopwatch, EventEmitter, loadModule, log, isBrowser, isNodeJs, listify, bufferToHex, hexToBuffer, integerToByteArray };
