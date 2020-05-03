import swarmResults from './swarmResults';
import readSwarmIndex from './readSwarmIndexLiveAsync';

function swarmSearch({ terms, page = 1, clientMaxResults, mediaType }) {
  const maxResults = clientMaxResults;

  const initialResultsToIgnore = (page - 1) * maxResults;

  return new Promise(success => {
    readSwarmIndex().then(swarmIndex => {
      const allResults = swarmResults(terms, swarmIndex);

      const results = allResults.slice(initialResultsToIgnore).slice(0, maxResults);

      const resultsFrom = (page - 1) * maxResults + 1;
      const resultsTo = resultsFrom + results.length - 1;
      const noMorePages = results.length < maxResults;
      const resultCount = results.length;

      const meta = { page, resultsFrom, resultsTo, noMorePages, resultCount };

      success({ results, meta });
    });
  });
}

export default swarmSearch;
