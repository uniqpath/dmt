import path from 'path';

import dmt from 'dmt/common';

export default function getPath(deviceName) {
  return path.join(dmt.deviceDir(deviceName), 'weblinks');
}
