import ZetaSearch from './lib/zetaSearch';
import settings from './settings';

import detectMediaType from './lib/utils/detectMediaType';
import { parseArgs, serializeArgs } from './lib/utils/args';

import initActor from './actor';

import searchPredicate from './lib/utils/simpleSearchPredicate';

function init(program) {
  initActor(program);
}

export { init, ZetaSearch, detectMediaType, parseArgs, serializeArgs, searchPredicate, settings };
