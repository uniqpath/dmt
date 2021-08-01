import dmt from 'dmt/common';
const { def, dmtContent } = dmt;

import { ParaSearch } from 'dmt/search';
import LocalPlayer from '../lib/localPlayer';

function setup({ program }) {
  const playerInfo = dmt.services('player');
  if (!playerInfo) {
    throw new Error('Cannot find player service definition');
  }

  const contentRefs = def.values(playerInfo.contentRef);
  const contentProviders = dmtContent.parseContentRefs(contentRefs);

  const { fiberPool } = program;

  const paraSearch = new ParaSearch({ connectorPool: fiberPool, contentProviders });
  const player = new LocalPlayer({ program });

  return { paraSearch, player };
}

export default setup;
