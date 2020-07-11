import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';

import linkIndexPath from './linkIndexPath';

function readLinkIndex({ useBackup = false } = {}) {
  const indexFile = path.join(linkIndexPath(), 'index.json');

  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile));
  }

  const indexFile2 = path.join(linkIndexPath(), 'index_emergency_backup.json');

  if (useBackup && fs.existsSync(indexFile2)) {
    return JSON.parse(fs.readFileSync(indexFile2));
  }

  return [];
}

export default readLinkIndex;
