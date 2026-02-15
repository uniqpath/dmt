import pad from './pad.js';

import os from 'os';

let padding = 2,
  pid = pad(process.pid.toString(36), padding),
  hostname = os.hostname(),
  length = hostname.length,
  hostId = pad(
    hostname
      .split('')
      .reduce(function(prev, char) {
        return +prev + char.charCodeAt(0);
      }, +length + 36)
      .toString(36),
    padding
  );

export default function fingerprint() {
  return pid + hostId;
}
