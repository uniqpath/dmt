import MultiProviderSearch from './lib/multiProviderSearch';

import { parseArgs, serializeArgs } from './lib/args';

import initActor from './actor';

function init(program) {
  initActor(program);
}

export { init, parseArgs, serializeArgs, MultiProviderSearch };
