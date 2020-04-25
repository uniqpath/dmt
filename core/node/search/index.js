import MultiProviderSearch from './lib/multiProviderSearch';

import { parseArgs, serializeArgs } from './lib/args';

import initActor from './actor';

import detectMediaType from './lib/detectMediaType';

function init(program) {
  initActor(program);
}

export { init, MultiProviderSearch, detectMediaType, parseArgs, serializeArgs };
