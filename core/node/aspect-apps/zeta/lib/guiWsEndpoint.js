import GUISearchObject from './rpcTargets/guiSearchObject';
import GUIPlayerObject from './rpcTargets/guiPlayerObject';
import GUIFrontendAcceptor from './rpcTargets/guiFrontendAcceptor';

function wsEndpointWrap({ program, backendStore }) {
  return ({ channel }) => wsEndpoint({ program, backendStore, channel });
}

function wsEndpoint({ program, backendStore, channel }) {
  channel.registerRemoteObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.registerRemoteObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
  channel.registerRemoteObject('GUIFrontendAcceptor', new GUIFrontendAcceptor({ program, backendStore, channel }));

  const unsubscribe = backendStore.subscribe(state => {
    if (!channel.closed()) {
      channel.send({ state });
    }
  });

  channel.on('channel_closed', unsubscribe);
}

export default wsEndpointWrap;
