import { log, util, disconnectedIPAddress } from 'dmt/common';
const { mkdirp } = util;

import getReferencedSambaShares from './getReferencedSambaShares';

export default function prepareMountpoints(program) {
  const list = [];

  const nearbyDevices = program.store('nearbyDevices').get();

  for (const el of getReferencedSambaShares()) {
    const match = nearbyDevices.find(({ deviceName }) => deviceName == el.deviceName);

    if (match && !match.stale && !disconnectedIPAddress(match.ip)) {
      const { mountPath } = el;
      try {
        mkdirp(mountPath);

        list.push({ ...el, sambaServerIp: match.ip });
      } catch (e) {
        log.yellow('Warning:');
        log.yellow(e);
      }
    }
  }

  return list;
}
