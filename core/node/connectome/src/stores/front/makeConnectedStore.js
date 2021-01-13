import ConnectedStore from './connectedStore/connectedStore.js';

export default function makeConnectedStore(opts) {
  const store = new ConnectedStore(opts);

  const { connected, action: sendJSON, remoteObject, connector } = store;

  const api = remoteObject.bind(store);

  return { state: store, connected, api };
}
