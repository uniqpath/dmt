const dmt = require('dmt-bridge');
const { log } = dmt;

const wsServer = require('./gui-backend/ws_servers');
const staticServer = require('./gui-backend/subcomponent-static-http-server');
const guiServerOptions = require('./guiServerOptions');

const loadGuiViewsDef = require('./loadGuiViewsDef');

const reduceSizeOfStateForGUI = require('./gui-backend/reduceSizeOfStateForGUI');

function init(program) {
  loadGuiViewsDef(program);

  try {
    wsServer.listen(program);
  } catch (e) {
    log.red(e);
  }

  try {
    staticServer(guiServerOptions(program));
  } catch (e) {
    log.red(e);
  }
}

module.exports = {
  init,
  staticServer,
  reduceSizeOfStateForGUI
};
