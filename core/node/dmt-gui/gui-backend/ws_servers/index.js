const dmt = require('dmt-bridge');
const { log } = dmt;

const name = 'gui websocket';
const GuiResponder = require('./wsResponder');

function listen(program) {
  const port = dmt.services('gui').wsPort;

  log.green('%s listening at ws://%s:%s', name || 'Server', 'localhost', port);

  const guiResponder = new GuiResponder();
  guiResponder.init({ program, port });
}

module.exports = { listen };
