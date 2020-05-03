import { settings } from 'dmt/search';

import dmt from 'dmt/bridge';
const { stopwatchAdv, dmtContent } = dmt;

import multipathSearch from './multipathSearch';

function contentSearch({ contentId, terms, mediaType, page = 1, clientMaxResults, maxResults }) {
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

    multipathSearch({ contentPaths, terms, page, maxResults: _maxResults, mediaType })
      .then(results => {
        const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);

        const resultsFrom = (page - 1) * _maxResults + 1;
        const resultsTo = resultsFrom + results.length - 1;

        const noMorePages = results.length < _maxResults;

        success({
          meta: {
            searchTime,
            searchTimePretty,
            page,
            noMorePages,
            resultsFrom,
            resultsTo,
            maxResults: _maxResults,
            resultCount: results.length
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
