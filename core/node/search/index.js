import ParaSearch from './lib/paraSearch';
import addSiteTag from './lib/localSearch/linkSearch/addSiteTag.js';
import settings from './settings';

import detectMediaType from './lib/utils/detectMediaType';
import { parseSearchQuery, reconstructSearchQuery, serializeContentRefs } from './lib/utils/query';

import initActor from './actor';
import initObserver1 from './clickObservers/searchNotify';
import initObserver2 from './clickObservers/saveRecentClicks';

import { searchPredicate, normalizeTerms } from './lib/utils/simpleSearchPredicate';

function init(program) {
  initActor(program);

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
