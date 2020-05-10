import { searchPredicate } from 'dmt/search';

function swarmResults(queryStr, indices) {
  const results = indices.flat().filter(entry => searchPredicate(`${entry.noteTags}`, queryStr));

  return results;
}

export default swarmResults;
