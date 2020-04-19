import dmt from 'dmt-bridge';

import SearchClient from '../lib/searchClient';

function setup({ program, actorName }) {
  const providers = [dmt.thisProvider()];

  const searchClient = new SearchClient(providers);

  return { searchClient };
}

export default setup;
