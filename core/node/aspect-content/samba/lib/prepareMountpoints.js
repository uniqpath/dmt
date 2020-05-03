import fs from 'fs';

import getReferencedSambaShares from './getReferencedSambaShares';

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: '0755', recursive: true });
  }
}

export default function prepareMountpoints() {
  const list = getReferencedSambaShares();

  for (const { mountPath } of list) {
    mkdir(mountPath);
  }

  return list;
}
