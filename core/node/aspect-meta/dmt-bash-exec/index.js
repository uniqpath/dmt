import { scriptActionHandler } from './scriptsThroughUserActions';

import platformTools from './platformTools';

function init(program) {
  program.on('action', ({ action, storeName }) => scriptActionHandler({ program, action, storeName }));
}

export { init, platformTools };
