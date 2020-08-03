import path from 'path';

import dmt from 'dmt/bridge';

export default function getPath(deviceId) {
  return path.join(dmt.deviceDir(deviceId), 'weblinks');
}
