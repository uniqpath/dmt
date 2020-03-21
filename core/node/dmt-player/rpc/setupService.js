import dmt from 'dmt-bridge';
const { def, cli, log } = dmt;

import colors from 'colors';

import { SearchClient } from 'dmt-search';
import LocalPlayer from '../lib/localPlayer';

import mapToLocal from '../lib/mapToLocal';

function setup({ program }) {
  const playerInfo = dmt.services('player');
  if (!playerInfo) {
    throw new Error('Cannot find player service definition');
  }

  const contentRefs = def.values(playerInfo.contentRef);
  const providers = dmt.providersFromContentRefs(contentRefs);

  const searchClient = new SearchClient(providers);
  const player = new LocalPlayer({ program });

  return { searchClient, player };
}

export default setup;
