import path from 'path';

import dmt from 'dmt/bridge';

export default function getPath(deviceName) {
  return path.join(dmt.deviceDir(deviceName), 'weblinks');
}
