import fs from 'fs';

import { zetaDeviceMasterPeerlistFilePath } from './paths';

export default function isMasterNode() {
  return fs.existsSync(zetaDeviceMasterPeerlistFilePath);
}
