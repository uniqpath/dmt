import colors from 'colors';

import path from 'path';
import fs from 'fs';

import dmt from 'dmt/bridge';
const { log } = dmt;

import staticServerSetup from './gui-backend/subcomponent-static-http-server/setup';
import guiServerOptions from './guiServerOptions';

import loadGuiViewsDef from './loadGuiViewsDef';

import reduceSizeOfStateForGUI from './gui-backend/reduceSizeOfStateForGUI';

import makeWsEndpoint from './gui-backend/wsEndpoint/wsEndpoint';

function init(program) {
  loadGuiViewsDef(program);

  const protocol = 'dmt';
  const protocolLane = 'gui';

  const wsEndpoint = makeWsEndpoint({ program });

  const channelList = program.addWsEndpoint({ protocol, protocolLane, wsEndpoint });

  program.on('state_diff', ({ diff }) => {
    channelList.sendToAll({ diff });
  });

  program.on('send_to_connected_guis', ({ action, payload }) => {
    log.cyan(
      `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
        payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
      }`
    );

    if (action == 'reload') {
      loadGuiViewsDef(program);
    }

    channelList.remoteCallAll('Frontend', 'reverseAction', { action, payload });
  });

  setTimeout(() => {
    const reloadFile = path.join(dmt.dmtPath, 'state/gui_reload.txt');

    fs.access(reloadFile, fs.constants.R_OK, err => {
      if (err) {
        return;
      }

      loadGuiViewsDef(program);

      program.emit('send_to_connected_guis', { action: 'reload' });

      fs.unlink(reloadFile, err => {
        if (err) {
          log.red(err);
        }
      });
    });
  }, 2000);

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