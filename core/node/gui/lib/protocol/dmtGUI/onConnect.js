import os from 'os';
import dmt from 'dmt/bridge';

import handleErrorFromGui from './helpers/handleErrorFromGui';

import PlayerRemoteTarget from './objects/player';
import LegacyActionHandler from './objects/legacyActionHandler--brisi-after-svelte2';

function onConnect({ program, channel }) {
  channel.attachObject('player', new PlayerRemoteTarget({ program }));
  channel.attachObject('gui', new LegacyActionHandler({ program }));

  loadInitialView(channel);

  channel.on('action', ({ action, namespace, payload }) => {
    if (namespace == 'gui_errors') {
      handleErrorFromGui(payload);
      return;
    }

    if (action == 'show_frontend_log') {
      program.store.update({ device: { showFrontendLog: true } });
      return;
    }

    if (action == 'close_frontend_log') {
      program.store.removeSlotElement({ slotName: 'device', key: 'showFrontendLog' });
      return;
    }

    // 💡 different parts of the system (core or through included middleware / dmt app hooks)
    program.emit('dmt_gui_action', { action, namespace, payload });
  });
}

function loadInitialView(channel) {
  if (os.uptime() <= 60 && !channel.initialIdleViewLoad) {
    const { idleView } = dmt.services('gui');

    channel.initialIdleViewLoad = true;

    if (idleView) {
      setTimeout(() => {
        channel.remoteObject('Frontend').call('reverseAction', { action: 'load', payload: idleView });
      }, 500);
    }
  }
}

export default onConnect;
