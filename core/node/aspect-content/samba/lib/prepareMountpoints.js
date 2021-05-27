import fs from 'fs';
import dmt from 'dmt/bridge';
const { mkdirp } = dmt.util;

import getReferencedSambaShares from './getReferencedSambaShares';

export default function prepareMountpoints() {
  const list = getReferencedSambaShares();

  for (const { mountPath } of list) {
    mkdirp(mountPath);
  }

  return list;
}
