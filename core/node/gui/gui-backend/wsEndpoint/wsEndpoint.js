import os from 'os';
import dmt from 'dmt/bridge';

import reduceSizeOfStateForGUI from '../reduceSizeOfStateForGUI';

import GuiRemoteTarget from './rpcTargets/guiRemoteTarget';
import PlayerRemoteTarget from './rpcTargets/playerRemoteTarget';

function wsEndpointWrapper({ program }) {
  return ({ channel }) => wsEndpoint({ program, channel });
}

function wsEndpoint({ program, channel }) {
  channel.registerRemoteObject('gui', new GuiRemoteTarget({ program }));
  channel.registerRemoteObject('player', new PlayerRemoteTarget({ program }));

  loadInitialView(channel);

  const state = reduceSizeOfStateForGUI(program.state);
  channel.send({ state });
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

export default wsEndpointWrapper;
