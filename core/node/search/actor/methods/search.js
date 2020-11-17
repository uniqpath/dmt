import dmt from 'dmt/bridge';
const { log, dmtContent } = dmt;

import { parseSearchQuery } from '../../lib/utils/query';
import normalizeTerms from '../../lib/utils/normalizeTerms';

import ZetaSearch from '../../lib/zetaSearch';

function search({ args, method }, { program }) {
  const { query, place, searchOriginHost } = args;

  return new Promise((success, reject) => {
    const options = parseSearchQuery({ query, actorName: 'search' });

    options.terms = normalizeTerms(options.terms);

    options.place = place;

    const { atDevices: contentProviders } = options;

    if (contentProviders.length == 0) {
      contentProviders.push(dmtContent.localDefaultContent());
    }

    delete options.atDevices;

    const { connectorPool } = program;

    const zetaSearch = new ZetaSearch({ connectorPool, contentProviders, searchOriginHost });

    zetaSearch
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
