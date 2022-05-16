import { log, dmtContent } from 'dmt/common';

import { parseSearchQuery } from '../../lib/utils/query';
import normalizeTerms from '../../lib/utils/normalizeTerms';

import ParaSearch from '../../lib/paraSearch';

function search({ args, method }, { program }) {
  const { query, selectedTags, place, searchOriginHost } = args;

  return new Promise((success, reject) => {
    const options = parseSearchQuery({ query, actorName: 'search' });

    options.terms = normalizeTerms(options.terms);

    options.place = place;

    options.selectedTags = selectedTags;

    const { atDevices: contentProviders } = options;

    if (contentProviders.length == 0) {
      contentProviders.push(dmtContent.localDefaultContent());
    }

    delete options.atDevices;

    const { fiberPool } = program;

    const paraSearch = new ParaSearch({ connectorPool: fiberPool, contentProviders, searchOriginHost });

    paraSearch
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
