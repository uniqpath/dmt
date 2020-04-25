import fs from 'fs';

import dmt from 'dmt/bridge';

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: '0755', recursive: true });
  }
}

export default function prepareMountpoints() {
  const list = dmt.getReferencedSambaShares();

  for (const { mountPath } of list) {
    mkdir(mountPath);
  }

  return list;
}
