import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';

function readLinkIndex({ useBackup = false } = {}) {
  const indexFile = path.join(dmt.userDir, 'ZetaLinks/index.json');

  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile));
  }

  const indexFile2 = path.join(dmt.userDir, 'ZetaLinks/index_emergency_backup.json');

  if (useBackup && fs.existsSync(indexFile2)) {
    return JSON.parse(fs.readFileSync(indexFile2));
  }

  return [];
}

export default readLinkIndex;
