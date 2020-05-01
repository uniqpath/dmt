import swarmResults from './swarmResults';
import readSwarmIndex from './readSwarmIndexLiveAsync';

class SwarmSearch {
  search({ terms, clientMaxResults }) {
    return new Promise(success => {
      readSwarmIndex().then(swarmIndex => {
        const allResults = swarmResults(terms, swarmIndex);

        const results = clientMaxResults ? allResults.slice(0, clientMaxResults) : allResults;

        success({ results, maxResults: allResults.length });
      });
    });
  }
}

export default SwarmSearch;