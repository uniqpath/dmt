import { log } from 'dmt/common';

import staticServerSetup from './lib/subcomponent-static-http-server/setup';
import guiServerOptions from './guiServerOptions';

import reduceSizeOfStateForGUI from './lib/protocol/dmtGUI/helpers/reduceSizeOfStateForGUI';
import setupDMTGUIProtocol from './lib/protocol/dmtGUI/index';

function init(program) {
  setupDMTGUIProtocol({ program });

  const expressAppSetup = app => {
    try {
      staticServerSetup(app, guiServerOptions());
    } catch (e) {
      log.red(e);
    }
  };

  return { expressAppSetup };
}

export { init, reduceSizeOfStateForGUI };
