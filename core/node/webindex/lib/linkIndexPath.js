import path from 'path';

import { deviceDir } from 'dmt/common';

export default function getPath(deviceName) {
  return path.join(deviceDir(deviceName), 'weblinks');
}
