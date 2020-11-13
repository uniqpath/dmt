import GUISearchObject from './objects/search';
import GUIPlayerObject from './objects/player';
import GUIFrontendAcceptor from './objects/frontendAcceptor';

import { push } from 'dmt/notify';

function onConnect({ program, backendStore, channel }) {
  channel.attachObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.attachObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
  channel.attachObject('GUIFrontendAcceptor', new GUIFrontendAcceptor({ program, backendStore, channel }));

  const unsubscribe = backendStore.subscribe(state => {
    if (!channel.closed()) {
      channel.send({ state });
    }
  });

  channel.on('disconnect', unsubscribe);
}

export default ({ backendStore }) => {
  return ({ program, channel }) => onConnect({ program, backendStore, channel });
};
