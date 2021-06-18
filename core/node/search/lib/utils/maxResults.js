import dmt from 'dmt/common';
import { settings } from 'dmt/search';

function maxResults(serviceId = 'search') {
  const globalHardcodedLimit = settings().searchLimit.maxResults;

  let serverMaxResults = dmt.services(serviceId) && (dmt.services(serviceId).serverMaxResults || dmt.services(serviceId).maxResults);
  if (serverMaxResults) {
    serverMaxResults = Math.min(globalHardcodedLimit, serverMaxResults);
  }

  let serverMaxResultsForSearchService = dmt.services('search') && (dmt.services('search').serverMaxResults || dmt.services('search').maxResults);
  if (serverMaxResultsForSearchService) {
    serverMaxResultsForSearchService = Math.min(globalHardcodedLimit, serverMaxResultsForSearchService);
  }

  return {
    serverMaxResults: Math.min(globalHardcodedLimit, serverMaxResults || serverMaxResultsForSearchService)
  };
}

export default maxResults;
