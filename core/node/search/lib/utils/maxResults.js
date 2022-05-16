import { services } from 'dmt/common';
import { settings } from 'dmt/search';

function maxResults(serviceId = 'search') {
  const globalHardcodedLimit = settings().searchLimit.maxResults;

  let serverMaxResults = services(serviceId) && (services(serviceId).serverMaxResults || services(serviceId).maxResults);
  if (serverMaxResults) {
    serverMaxResults = Math.min(globalHardcodedLimit, serverMaxResults);
  }

  let serverMaxResultsForSearchService = services('search') && (services('search').serverMaxResults || services('search').maxResults);
  if (serverMaxResultsForSearchService) {
    serverMaxResultsForSearchService = Math.min(globalHardcodedLimit, serverMaxResultsForSearchService);
  }

  return {
    serverMaxResults: Math.min(globalHardcodedLimit, serverMaxResults || serverMaxResultsForSearchService)
  };
}

export default maxResults;
