import MultiProviderSearch from './lib/multiProviderSearch';

import detectMediaType from './lib/utils/detectMediaType';
import { parseArgs, serializeArgs } from './lib/utils/args';

import initActor from './actor';

function init(program) {
  initActor(program);
}

export { init, MultiProviderSearch, detectMediaType, parseArgs, serializeArgs };
