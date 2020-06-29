import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

const { log } = dmt;

class GUIFrontendAcceptor {
  constructor({ program, backendStore, channel }) {
    this.program = program;
    this.backendStore = backendStore;
    this.channel = channel;
  }

  getUserIdentity({ address, urlHostname }) {
    if (!address) {
      push.notify('WARNING: getUserIdentity called with empty address');
    }

    if (urlHostname != 'localhost') {
      log.write(`Login with ${address}`);
    }

    return this.backendStore.getUserIdentity(address);
  }

  saveUserProfile(options) {
    this.backendStore.saveUserProfile(options);
  }
}

export default GUIFrontendAcceptor;
