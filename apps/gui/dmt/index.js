import { log } from 'dmt/common';

import staticServerSetup from './serve/setup.js';
import guiServerOptions from './guiServerOptions.js';

function init(program) {
  //if (program.device.try('service[gui].disable') == 'true') {
  // we do this mostly because it messes with redirects (/ to /home) ... and on server we want / to /dmt-search for example
  // in server mode we set / -> dmt-search in apps-server -- setupRedirects.js
  if (program.device.serverMode) {
    log.yellow('Not loading legacy GUI because in serverMode');
    return;
  }

  const expressAppSetup = app => {
    try {
      staticServerSetup(app, guiServerOptions());
    } catch (e) {
      log.red(e);
    }
  };

  // LEGACY ... allows for custom express setup which can mount stuff anywhere
  return { expressAppSetup };
}

export { init };
