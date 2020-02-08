import dmt from 'dmt-bridge';
const { log } = dmt;

import GuiResponder from './wsResponder';

const name = 'gui websocket';
export default function listen(program) {
  const port = dmt.services('gui').wsPort;

  log.green('%s listening at ws://%s:%s', name || 'Server', 'localhost', port);

  const guiResponder = new GuiResponder();
  guiResponder.init({ program, port });
}
