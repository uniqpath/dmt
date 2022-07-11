import { settings } from 'dmt/search';

import { stopwatchAdv, dmtContent, promiseTimeout } from 'dmt/common';

import { fiberHandle } from 'dmt/connectome-next';

import multipathSearch from './multipathSearch';

import sortFiles from '../../sortResults/sortFiles';

function contentSearch({ contentId, place, terms, mediaType, page = 1, count, maxResults }) {
  const _maxResults = count || maxResults || settings().searchLimit.maxResults;

  const searchPromise = new Promise((success, reject) => {
    let contentPaths;

    if (place) {
      contentPaths = [fiberHandle.decode(place)];
    } else {
      try {
        contentPaths = dmtContent.contentPaths({ contentId });
      } catch (e) {
        reject(e);
        return;
      }
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
          results: sortFiles(results)
        });
      })
      .catch(reject);
  });

  const { maxTimeLocalBinaryExecution } = settings().searchLimit;

  return promiseTimeout(maxTimeLocalBinaryExecution, searchPromise);
}

export default contentSearch;
