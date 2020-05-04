import path from 'path';
import os from 'os';
const { homedir } = os;

import dmt from 'dmt/bridge';
const { def, dmtContent } = dmt;

let cachedReferencedSambaShares;

function getReferencedSambaShares() {
  if (cachedReferencedSambaShares) {
    return cachedReferencedSambaShares;
  }

  const playerInfo = dmt.services('player');

  if (!playerInfo) {
    return [];
  }

  const device = dmt.device({ onlyBasicParsing: true });

  const contentRefs = def.values(playerInfo.contentRef);
  const providers = dmtContent.parseContentRefs(contentRefs);

  const list = [];

  for (const provider of providers.filter(p => !p.localhost && p.hostType == 'dmt')) {
    const deviceId = provider.host;
    const { contentId } = provider;

    const { sambaShare, sambaPath } = dmtContent.contentPaths({ contentId, deviceId, returnSambaSharesInfo: true });

    if (!sambaShare) {
      throw new Error(
        `@${deviceId}/${contentId} should be a sambaShare, not a list of paths. This is because it is referenced from player in ${device.id}/def/device.def`
      );
    }

    const mountBase = `${homedir()}/DMTMountedMedia/${deviceId}`;
    const mountPath = path.join(mountBase, sambaShare);

    list.push({ deviceId, sambaServerIp: provider.ip, contentId, mountPath, sambaShare, sambaPath });
  }

  cachedReferencedSambaShares = list;

  return list;
}

export default getReferencedSambaShares;
