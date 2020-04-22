import fs from 'fs';

import dmt from 'dmt-bridge';
const { stopwatchAdv, prettyFileSize, log } = dmt;

import stripAnsi from 'strip-ansi';

import searchWithOSBinary from './searchWithOSBinary';

function contentSearch(contentId, { terms, mediaType, clientMaxResults, maxResults }) {
  log.debug('Search called with:', { obj: { contentId, terms, mediaType, clientMaxResults, maxResults } });

  const _maxResults = clientMaxResults || maxResults || dmt.globals.searchLimit.maxResults;

  const searchPromise = new Promise((success, reject) => {
    let contentPaths;

    try {
      contentPaths = dmt.contentPaths({ contentId });
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
    const results = [];

    searchWithOSBinary(dmt.globals.searchBinary, { path, terms, maxResults, mediaType }, resultBatch => {
      if (resultBatch) {
        if (resultBatch.error) {
          success({ error: resultBatch.error });
          return;
        }

        resultBatch = resultBatch
          .map(filePathANSI => {
            const filePath = stripAnsi(filePathANSI);
            const fileSize = fs.statSync(filePath).size;

            return {
              filePath,
              filePathANSI,
              fileSize,
              fileSizePretty: prettyFileSize(fileSize)
            };
          })
          .filter(Boolean);

        results.push(...resultBatch);
      } else {
        success(results.sort());
      }
    });
  });
}

export default contentSearch;
