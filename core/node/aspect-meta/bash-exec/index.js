import { scriptActionHandler } from './scriptsThroughUserActions';

import platformTools from './platformTools';

function init(program) {
  program.on('dmt_gui_action', ({ action, namespace }) => scriptActionHandler({ program, action, namespace }));
}

export { init, platformTools };
