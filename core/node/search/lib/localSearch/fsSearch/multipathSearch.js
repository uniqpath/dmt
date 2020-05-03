import fs from 'fs';

import { settings } from 'dmt/search';

import dmt from 'dmt/bridge';
const { prettyFileSize, log, util } = dmt;

import stripAnsi from 'strip-ansi';

import searchWithOSBinary from './searchWithOSBinary';

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

    searchWithOSBinary(settings().searchBinary, { path, terms, maxResults, mediaType }, resultBatch => {
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
        success(results.sort(util.compareValues('filePath')));
      }
    });
  });
}

export default multipathSearch;
