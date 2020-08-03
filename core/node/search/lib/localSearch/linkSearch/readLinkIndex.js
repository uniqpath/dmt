import fs from 'fs';
import path from 'path';

import linkIndexPath from './linkIndexPath';

function readLinkIndex({ deviceId, useBackup = false } = {}) {
  const indexFile = path.join(linkIndexPath(deviceId), 'index.json');

  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile));
  }

  const indexFile2 = path.join(linkIndexPath(deviceId), 'index_emergency_backup.json');

  if (useBackup && fs.existsSync(indexFile2)) {
    return JSON.parse(fs.readFileSync(indexFile2));
  }

  return [];
}

export default readLinkIndex;
