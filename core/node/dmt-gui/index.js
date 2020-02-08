import dmt from 'dmt-bridge';
const { log } = dmt;

import wsServer from './gui-backend/ws_servers';
import staticServer from './gui-backend/subcomponent-static-http-server';
import guiServerOptions from './guiServerOptions';

import loadGuiViewsDef from './loadGuiViewsDef';

import reduceSizeOfStateForGUI from './gui-backend/reduceSizeOfStateForGUI';

function init(program) {
  loadGuiViewsDef(program);

  try {
    wsServer(program);
  } catch (e) {
    log.red(e);
  }

  try {
    staticServer(guiServerOptions(program));
  } catch (e) {
    log.red(e);
  }
}

export { init, staticServer, reduceSizeOfStateForGUI };
