import GUISearchObject from './rpcTargets/guiSearchObject';
import GUIPlayerObject from './rpcTargets/guiPlayerObject';

function wsEndpointWrap({ program }) {
  return ({ channel }) => wsEndpoint({ program, channel });
}

function wsEndpoint({ program, channel }) {
  channel.registerRemoteObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.registerRemoteObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
}

export default wsEndpointWrap;
