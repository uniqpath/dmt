import GUISearchObject from './objects/search';
import GUIPlayerObject from './objects/player';
import GUIFrontendAcceptor from './objects/frontendAcceptor';

import { push } from 'dmt/notify';

function wsEndpointWrap({ program, backendStore }) {
  return ({ channel }) => wsEndpoint({ program, backendStore, channel });
}

function wsEndpoint({ program, backendStore, channel }) {
  channel.attachObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.attachObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
  channel.attachObject('GUIFrontendAcceptor', new GUIFrontendAcceptor({ program, backendStore, channel }));

  const unsubscribe = backendStore.subscribe(state => {
    if (!channel.closed()) {
      channel.send({ state });
    }
  });

  channel.on('channel_closed', unsubscribe);
}

export default wsEndpointWrap;
