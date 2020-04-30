import dmt from 'dmt/bridge';
const { log } = dmt;

import { parseArgs } from '../../lib/utils/args';

import MultiProviderSearch from '../../lib/multiProviderSearch';

function search({ args, method }, { program }) {
  const { query, searchOriginHost } = args;

  return new Promise((success, reject) => {
    const options = parseArgs({ args: query, actorName: 'search' });

    const { atDevices } = options;

    delete options.atDevices;

    const searchClient = new MultiProviderSearch({ program, providers: atDevices, searchOriginHost });

    searchClient
      .search(options)
      .then(success)
      .catch(e => {
        log.red('Error in search service:');
        log.red(e);

        reject(e);
      });
  });
}

export default search;
