import path from 'path';

import dmt from 'dmt/bridge';

export default function getPath() {
  return path.join(dmt.deviceDir(), 'weblinks');
}
