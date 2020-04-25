import SimpleStore from './simpleStore';
import ConnectedStore from './connectedStore';

class MultiConnectedStore extends SimpleStore {
  constructor({ port, protocol, protocolLane, session, initialIp }) {
    super();

    this.session = session;

    this.activeStoreId = 0;
    this.currentIp = window.location.hostname;

    this.port = port;
    this.protocol = protocol;
    this.protocolLane = protocolLane;

    this.stores = [];
    this.switch({ ip: this.currentIp });

    if (initialIp) {
      this.switch({ ip: initialIp });
    }
  }

  remoteObject(handle) {
    return this.activeStore.remoteObject(handle);
  }

  switch({ deviceId, ip }) {
    let matchingStore;

    this.stores.forEach((store, index) => {
      if (store.ip == ip) {
        matchingStore = store;
      }
    });

    this.currentIp = ip;

    if (!matchingStore) {
      const newStore = new ConnectedStore({ ip, port: this.port, protocol: this.protocol, protocolLane: this.protocolLane, session: this.session });
      matchingStore = newStore;

      newStore.subscribe(state => {
        if (state.ip == this.currentIp) {
          this.set(state);
        }
      });

      this.stores.push(newStore);
    }

    this.set(matchingStore.state);

    this.activeStore = matchingStore;
  }
}

export default MultiConnectedStore;
