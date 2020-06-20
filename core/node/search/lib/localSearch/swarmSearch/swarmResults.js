import { searchPredicate } from 'dmt/search';

import checkForDuplicates from './checkForDuplicates';

function swarmResults(queryStr, indices) {
  const results = indices
    .flat()
    .filter(entry =>
      searchPredicate(
        `${entry.name} ${entry.context} ${entry.mediaType} ${entry.hiddenContext} ${entry.people ? entry.people.join(' ') : ''} ${entry.language}`,
        queryStr
      )
    );

  return checkForDuplicates(results);
}

export default swarmResults;
