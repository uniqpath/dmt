import GUISearchObject from './rpcTargets/guiSearchObject';
import GUIPlayerObject from './rpcTargets/guiPlayerObject';
import GUIFrontendStateAcceptor from './rpcTargets/guiFrontendStateAcceptor';

function wsEndpointWrap({ program, backendStore }) {
  return ({ channel }) => wsEndpoint({ program, backendStore, channel });
}

function wsEndpoint({ program, backendStore, channel }) {
  channel.registerRemoteObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.registerRemoteObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
  channel.registerRemoteObject('GUIFrontendStateAcceptor', new GUIFrontendStateAcceptor({ program, backendStore, channel }));

  const unsubscribe = backendStore.subscribe(state => {
    if (!channel.closed()) {
      channel.send({ state });
    }
  });

  channel.on('channel_closed', unsubscribe);
}

export default wsEndpointWrap;
