import fs from 'fs';

import dmt from 'dmt-bridge';
const { log } = dmt;

import stopwatch from 'pretty-hrtime';

import searchWithOSBinary from './searchWithOSBinary';

function contentSearch(contentId, { terms, mediaType, clientMaxResults, maxResults }) {
  log.debug('Search called with:', { obj: { contentId, terms, mediaType, clientMaxResults, maxResults } });

  const _maxResults = clientMaxResults || maxResults || dmt.globals.searchLimit.maxResults;

  const contentPaths = dmt.contentPaths({ contentId });

  const searchPromise = new Promise((success, reject) => {
    if (!contentPaths) {
      reject({ error: `undefined local content ref: ${dmt.device().id}/${contentId}` });
      return;
    }

    const start = process.hrtime();

    multipathSearch({ contentPaths, terms, maxResults: _maxResults, mediaType })
      .then(resultLines => {
        const end = process.hrtime(start);

        success({
          meta: {
            searchTime: stopwatch(end),
            maxResults: _maxResults
          },
          results: resultLines
        });
      })
      .catch(reject);
  });

  return dmt.promiseTimeout(dmt.globals.searchLimit.maxTimeLocalBinaryExecution, searchPromise);
}

function multipathSearch({ contentPaths, terms, maxResults, mediaType }) {
  return new Promise((success, reject) => {
    const promises = contentPaths
      .filter(path => fs.existsSync(path))
      .map(path => {
        return searchOnePath({ path, terms, maxResults, mediaType });
      });

    Promise.all(promises)
      .then(allResultsAndErrors => {
        const results = allResultsAndErrors.flat().slice(0, maxResults);
        success(results);
      })
      .catch(e => {
        log.red(`Promise.all error: ${e}`);
      });
  });
}

function searchOnePath({ path, terms, maxResults, mediaType }) {
  return new Promise((success, reject) => {
    let results = [];

    searchWithOSBinary(dmt.globals.searchBinary, { path, terms, maxResults, mediaType }, resultBatch => {
      if (resultBatch) {
        if (resultBatch.error) {
          success({ error: resultBatch.error });
          return;
        }

        results.push(...resultBatch);
      } else {
        success(results.sort());
      }
    });
  });
}

export default contentSearch;
