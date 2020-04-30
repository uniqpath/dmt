import GUISearchObject from './rpcTargets/guiSearchObject';

function wsEndpointWrap({ program }) {
  return ({ channel }) => wsEndpoint({ program, channel });
}

function wsEndpoint({ program, channel }) {
  channel.registerRemoteObject('GUISearchObject', new GUISearchObject({ program, channel }));
}

export default wsEndpointWrap;
