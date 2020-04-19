import SimpleStore from './simpleStore';
import ConnectedStore from './connectedStore';

class ParallelStore extends SimpleStore {
  constructor({ session, port, protocol, addressList }) {
    super();

    this.stores = [];

    for (const { ip } of addressList) {
      this.addStore({ ip, port, protocol, session });
    }
  }

  addStore({ ip, port, protocol, session }) {
    let matchingStore;

    this.stores.forEach((store, index) => {
      if (store.ip == ip) {
        matchingStore = store;
      }
    });

    this.currentIp = ip;

    if (!matchingStore) {
      const newStore = new ConnectedStore({ ip, port, protocol, session });
      matchingStore = newStore;

      newStore.subscribe(state => {
        if (state.ip == this.currentIp) {
          this.set(state);
        }
      });

      this.stores.push(newStore);
    }

    this.set(matchingStore.state);
  }
}

export default ParallelStore;
