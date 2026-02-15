import fastJsonPatch from 'fast-json-patch';

export default function compare(a, b) {
  return fastJsonPatch.compare(a, b).length == 0;
}
