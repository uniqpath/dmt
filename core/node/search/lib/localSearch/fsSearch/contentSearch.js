import { settings } from 'dmt/search';

import dmt from 'dmt/bridge';
const { stopwatchAdv, log, dmtContent } = dmt;

import multipathSearch from './multipathSearch';

function contentSearch(contentId, { terms, mediaType, clientMaxResults, maxResults }) {
  log.debug('Search called with:', { obj: { contentId, terms, mediaType, clientMaxResults, maxResults } });

  const _maxResults = clientMaxResults || maxResults || settings().searchLimit.maxResults;

  const searchPromise = new Promise((success, reject) => {
    let contentPaths;

    try {
      contentPaths = dmtContent.contentPaths({ contentId });
    } catch (e) {
      reject(e);
      return;
    }

    const start = stopwatchAdv.start();

    multipathSearch({ contentPaths, terms, maxResults: _maxResults, mediaType })
      .then(results => {
        const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);

        success({
          meta: {
            searchTime,
            searchTimePretty,
            maxResults: _maxResults
          },
          results
        });
      })
      .catch(reject);
  });

  const { maxTimeLocalBinaryExecution } = settings().searchLimit;

  return dmt.promiseTimeout(maxTimeLocalBinaryExecution, searchPromise);
}

export default contentSearch;
