import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

import loadGuiViewsDef from '../../../loadGuiViewsDef';
import onConnect from './onConnect';

export default function initProtocol({ program }) {
  loadGuiViewsDef(program);

  // 💡 hook program store actions (these are always received over appropriate gui protocol)
  const channelList = program.registerProtocol({ protocol: 'dmt', lane: 'gui', onConnect });

  program.store.mirror(channelList);

  log.dev('⚠️  Reminder: remove this GUITarget after dmt gui moves to Svelte3');

  program.on('send_to_connected_guis', ({ action, payload }) => {
    log.cyan(
      `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
        payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
      }`
    );

    if (action == 'reload') {
      loadGuiViewsDef(program);
    }

    channelList.signalAll('frontend_action', { action, payload });
  });
}
