import os from 'os';

import { services, log, colors } from 'dmt/common';

import PlayerRemoteTarget from './objects/player.js';

function onConnect({ program, channel }) {
  channel.attachObject('player', new PlayerRemoteTarget({ program }));

  loadInitialView(channel);
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
