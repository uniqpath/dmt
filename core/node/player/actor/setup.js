import dmt from 'dmt/bridge';
const { def, dmtContent } = dmt;

import { ZetaSearch } from 'dmt/search';
import LocalPlayer from '../lib/localPlayer';

function setup({ program }) {
  const playerInfo = dmt.services('player');
  if (!playerInfo) {
    throw new Error('Cannot find player service definition');
  }

  const contentRefs = def.values(playerInfo.contentRef);
  const contentProviders = dmtContent.parseContentRefs(contentRefs);

  const { fiberPool } = program;

  const zetaSearch = new ZetaSearch({ connectorPool: fiberPool, contentProviders });
  const player = new LocalPlayer({ program });

  return { zetaSearch, player };
}

export default setup;
