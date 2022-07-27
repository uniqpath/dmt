import ParaSearch from './lib/paraSearch.js';
import addSiteTag from './lib/localSearch/linkSearch/addSiteTag.js';
import settings from './settings.js';

import detectMediaType from './lib/utils/detectMediaType.js';
import { parseSearchQuery, reconstructSearchQuery, serializeContentRefs } from './lib/utils/query.js';

import initSearchApi from './apiSearch/index.js';
import initObserver1 from './clickObservers/searchNotify.js';
import initObserver2 from './clickObservers/saveRecentClicks.js';

import { searchPredicate, normalizeTerms } from './lib/utils/simpleSearchPredicate.js';

function init(program) {
  initSearchApi(program);

  initObserver1(program);
  initObserver2(program);
}

export {
  init,
  ParaSearch,
  detectMediaType,
  parseSearchQuery,
  reconstructSearchQuery,
  serializeContentRefs,
  searchPredicate,
  normalizeTerms,
  addSiteTag,
  settings
};
