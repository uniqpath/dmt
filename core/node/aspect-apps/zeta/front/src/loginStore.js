import { stores } from 'dmt-js';
const { SimpleStore } = stores;

class LoginStore extends SimpleStore {
  constructor({ verbose = false } = {}) {
    super();

    this.verbose = verbose;
  }

  login(ethAddress) {
    this.set({ ethAddress, loggedIn: true });
    this.emit('metamask_login', ethAddress);
  }
}

export default LoginStore;
