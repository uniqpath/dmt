import fs from 'fs';

import { zetaDeviceMasterPeerlistFilePath } from './paths';

export default function isReefBuilder() {
  return fs.existsSync(zetaDeviceMasterPeerlistFilePath);
}
