import MultiProviderSearch from './lib/multiProviderSearch';

import detectMediaType from './lib/utils/detectMediaType';
import { parseArgs, serializeArgs } from './lib/utils/args';

import initActor from './actor';

import searchPredicate from './lib/jsonObjectSearch/simpleSearchPredicate';

function init(program) {
  initActor(program);
}

export { init, MultiProviderSearch, detectMediaType, parseArgs, serializeArgs, searchPredicate };
