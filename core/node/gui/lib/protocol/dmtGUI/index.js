import { log, colors, isDevMachine } from 'dmt/common';

import loadGuiViewsDef from '../../../loadGuiViewsDef';

import onConnect from './onConnect';

export default function initProtocol({ program }) {
  loadGuiViewsDef(program);

  const channels = program.registerProtocol({ protocol: 'dmt/gui', onConnect });

  program.store().sync(channels);

  if (isDevMachine()) {
    log.magenta('⚠️  Reminder: remove this GUITarget after dmt gui moves to Svelte3');
  }

  program.on('send_to_connected_guis', ({ action, payload }) => {
    log.cyan(
      `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
        payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
      }`
    );

    if (action == 'reload') {
      loadGuiViewsDef(program);
    }

    channels.signalAll('frontend_action', { action, payload });
  });
}
