import linkResults from './linkResults';
import readLinkIndex from './readLinkIndex';

import dmt from 'dmt/bridge';

const deviceId = dmt.device({ onlyBasicParsing: true }).id;

function linkSearch({ terms, page = 1, count }) {
  const maxResults = count;

  const initialResultsToIgnore = (page - 1) * maxResults;

  return new Promise(success => {
    const linkIndex = readLinkIndex({ deviceId, useBackup: true });

    const allResults = linkResults(terms, linkIndex);

    const results = allResults.slice(initialResultsToIgnore).slice(0, maxResults);

    const resultsFrom = (page - 1) * maxResults + 1;
    const resultsTo = resultsFrom + results.length - 1;
    const noMorePages = results.length < maxResults;
    const resultCount = results.length;

    const meta = { page, resultsFrom, resultsTo, noMorePages, resultCount };

    success({ results, meta });
  });
}

export default linkSearch;
