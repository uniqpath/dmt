import fs from 'fs';
import dmt from 'dmt/common';
const { mkdirp } = dmt.util;

const { log } = dmt;

import getReferencedSambaShares from './getReferencedSambaShares';

export default function prepareMountpoints() {
  const list = [];

  for (const el of getReferencedSambaShares()) {
    const { mountPath } = el;
    try {
      mkdirp(mountPath);
      list.push(el);
    } catch (e) {
      log.yellow('Warning:');
      log.yellow(e);
    }
  }

  return list;
}
