import path from 'path';

import { scan, dmtPath, dmtHerePath } from 'dmt/common';

export default function ensureDirectories() {
  const dirs = [];
  dirs.push('log');
  dirs.push('state');
  dirs.push('user/wallpapers');
  for (const dir of dirs) {
    scan.ensureDirSync(path.join(dmtPath, dir));
  }

  scan.ensureDirSync(dmtHerePath);
}
