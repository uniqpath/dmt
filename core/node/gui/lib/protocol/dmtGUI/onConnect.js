import os from 'os';

import { services, log, colors } from 'dmt/common';

import handleErrorFromGui from './helpers/handleErrorFromGui';

import PlayerRemoteTarget from './objects/player';

function onConnect({ program, channel }) {
  channel.attachObject('player', new PlayerRemoteTarget({ program }));

  loadInitialView(channel);

  channel.on('action', ({ action, namespace, payload }) => {
    if (namespace == 'gui_errors') {
      handleErrorFromGui(payload);
      return;
    }

    if (action == 'show_frontend_log') {
      program.store('device').update({ showFrontendLog: true });
      return;
    }

    if (action == 'close_frontend_log') {
      program.store('device').removeKey('showFrontendLog');
      return;
    }

    log.gray(`Received user action ${colors.cyan(namespace)}::${colors.green(action)}`);
    if (payload) {
      log.gray('Payload: ', JSON.stringify(payload, null, 2));
    }

    // different parts of the system (core or through included middleware / dmt app hooks)
    program.emit('dmt_gui_action', { action, namespace, payload });
  });
}

function loadInitialView(channel) {
  if (os.uptime() <= 60 && !channel.initialIdleViewLoad) {
    const { idleView } = services('gui');

    channel.initialIdleViewLoad = true;

    if (idleView) {
      setTimeout(() => {
        channel.signal('frontend_action', { action: 'load', payload: idleView });
      }, 500);
    }
  }
}

export default onConnect;
