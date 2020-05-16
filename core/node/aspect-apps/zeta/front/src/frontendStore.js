import { stores } from 'dmt-js';
const { SimpleStore } = stores;

class FrontendStore extends SimpleStore {
  constructor({ verbose = false } = {}) {
    super();

    this.verbose = verbose;
  }

  login(ethAddress) {
    this.set({ ethAddress, loggedIn: true });
    this.emit('login', ethAddress);
  }
}

export default FrontendStore;
