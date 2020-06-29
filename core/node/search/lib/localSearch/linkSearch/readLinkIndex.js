import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';

function readLinkIndex() {
  const indexFile = path.join(dmt.userDir, 'ZetaLinks/index.json');

  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile));
  }

  return [];
}

export default readLinkIndex;
