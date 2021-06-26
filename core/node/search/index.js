import ParaSearch from './lib/paraSearch';
import settings from './settings';

import detectMediaType from './lib/utils/detectMediaType';
import { parseSearchQuery, reconstructSearchQuery, serializeContentRefs } from './lib/utils/query';

import initActor from './actor';
import initObserver from './observer';

import { searchPredicate, normalizeTerms } from './lib/utils/simpleSearchPredicate';

function init(program) {
  initActor(program);
  initObserver(program);
}

export { init, ParaSearch, detectMediaType, parseSearchQuery, reconstructSearchQuery, serializeContentRefs, searchPredicate, normalizeTerms, settings };
