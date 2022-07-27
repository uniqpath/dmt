import { log } from 'dmt/common';

import staticServerSetup from './lib/subcomponent-static-http-server/setup.js';
import guiServerOptions from './guiServerOptions.js';

import reduceSizeOfStateForGUI from './lib/protocol/dmtGUI/helpers/reduceSizeOfStateForGUI.js';
import setupDMTGUIProtocol from './lib/protocol/dmtGUI/index.js';

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
