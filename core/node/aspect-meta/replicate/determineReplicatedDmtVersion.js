import fs from 'fs';
import path from 'path';

import { dmtVersion, dmtPath } from 'dmt/common';

export default function determineReplicatedDmtVersion() {
  const zipVersionFile = path.join(dmtPath, 'state/dmt.zip.version.txt');

  if (fs.existsSync(path.join(dmtPath, 'state/dmt.zip')) && fs.existsSync(zipVersionFile)) {
    const zipVersion = fs
      .readFileSync(zipVersionFile)
      .toString()
      .trim();
    return zipVersion;
  }

  return dmtVersion();
}
