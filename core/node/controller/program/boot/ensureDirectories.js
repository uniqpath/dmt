import path from 'path';

import dmt from 'dmt/bridge';
const { scan } = dmt;

export default function ensureDirectories() {
  const dirs = [];
  dirs.push('log');
  dirs.push('state');
  dirs.push('user/wallpapers');
  for (const dir of dirs) {
    scan.ensureDirSync(path.join(dmt.dmtPath, dir));
  }
}
