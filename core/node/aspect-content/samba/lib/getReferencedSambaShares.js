import path from 'path';
import os from 'os';
const { homedir } = os;

import { def, dmtContent, services, device as _device } from 'dmt/common';

let cachedReferencedSambaShares;

function getReferencedSambaShares() {
  if (cachedReferencedSambaShares) {
    return cachedReferencedSambaShares;
  }

  const playerInfo = services('player');

  if (!playerInfo) {
    return [];
  }

  const device = _device({ onlyBasicParsing: true });

  const contentRefs = def.values(playerInfo.contentRef);
  const providers = dmtContent.parseContentRefs(contentRefs);

  const list = [];

  for (const provider of providers.filter(p => !p.localhost && p.hostType == 'dmt')) {
    const deviceName = provider.host;
    const { contentId } = provider;

    const { sambaShare, sambaPath } = dmtContent.contentPaths({ contentId, deviceName, returnSambaSharesInfo: true });

    if (!sambaShare) {
      throw new Error(
        `@${deviceName}/${contentId} should be a sambaShare, not a list of paths. This is because it is referenced from player in ${device.id}/def/device.def`
      );
    }

    const mountBase = `${homedir()}/DMTMountedMedia/${deviceName}`;
    const mountPath = path.join(mountBase, sambaShare);

    list.push({ deviceName, contentId, mountPath, sambaShare, sambaPath });
  }

  cachedReferencedSambaShares = list;

  return list;
}

export default getReferencedSambaShares;
