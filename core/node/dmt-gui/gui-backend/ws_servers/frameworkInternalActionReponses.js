import colors from 'colors';
import dmt from 'dmt-bridge';
const { log } = dmt;

import constructAction from './constructAction';
import integrationsStateChangeSetup from './integrationsStateChangeSetup';
import loadGuiViewsDef from '../../loadGuiViewsDef';

function gui({ storeName, action, payload, program, server }) {
  log.cyan(
    `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
      payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
    }`
  );

  if (action == 'reload') {
    loadGuiViewsDef(program);
  }

  server.sendAllChannels(constructAction({ action, storeName, payload }));
}

function rpc({ action, payload, program, channel }) {
  program.emit('ws_api_request', { action, payload, channel });
}

function connection({ action, channel, program }) {
  if (action == 'local_ws') {
  }
}

function actionsReponder({ storeName, action, payload, channel, server, program }) {
  switch (storeName) {
    case 'gui':
      gui({ storeName, action, payload, server, program });
      break;
    case 'rpc':
      rpc({ action, payload, program, channel });
      break;
    case 'connection':
      connection({ action, payload, program, channel });
      break;
    default:
      return false;
  }

  return true;
}

export default actionsReponder;
