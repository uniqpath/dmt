import { searchPredicate } from 'dmt/search';

function linkResults(queryStr, linkIndex) {
  const results = linkIndex.filter(entry => searchPredicate(`${entry.url} ${entry.context} ${entry.title}`, queryStr));

  return results;
}

export default linkResults;
