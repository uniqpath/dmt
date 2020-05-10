import ZetaSearch from './lib/zetaSearch';
import settings from './settings';

import detectMediaType from './lib/utils/detectMediaType';
import { parseSearchQuery, reconstructSearchQuery, serializeContentRefs } from './lib/utils/query';

import initActor from './actor';

import searchPredicate from './lib/utils/simpleSearchPredicate';

function init(program) {
  initActor(program);
}

export { init, ZetaSearch, detectMediaType, parseSearchQuery, reconstructSearchQuery, serializeContentRefs, searchPredicate, settings };
