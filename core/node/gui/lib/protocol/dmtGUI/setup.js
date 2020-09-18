import colors from 'colors';

import path from 'path';
import fs from 'fs';

import dmt from 'dmt/bridge';
const { log } = dmt;

import loadGuiViewsDef from '../../../loadGuiViewsDef';

import guiWsEndpointWrap from './endpoint';

export default function setup({ program }) {
  loadGuiViewsDef(program);

  // 💡 hook program store actions (these are always received over appropriate gui protocol)
  const wsEndpoint = guiWsEndpointWrap({ program });
  const channelList = program.addConnectomeEndpoint({ protocol: 'dmt', protocolLane: 'gui', wsEndpoint });

  log.dev('⚠️  Reminder: remove this GUITarget after dmt gui moves to Svelte3');

  // 💡 initial state is sent on each channel creation (in ./endpoint.js)
  program.store.on('state_diff', ({ diff }) => {
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
}
