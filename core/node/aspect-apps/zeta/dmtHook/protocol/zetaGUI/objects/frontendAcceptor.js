import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

const { log } = dmt;

class GUIFrontendAcceptor {
  constructor({ program, backendStore, channel }) {
    this.program = program;
    this.backendStore = backendStore;
    this.channel = channel;
  }

  getUserIdentity({ ethAddress, urlHostname }) {
    if (!ethAddress) {
      push.notify('WARNING: getUserIdentity called with empty address');
    }

    if (urlHostname != 'localhost') {
      log.write(`Login with ${ethAddress}`);
    }

    return this.backendStore.getUserIdentity(ethAddress);
  }

  emitProgramEvent(name, data) {
    this.program.emit(name, data);
  }

  saveUserProfile(options) {
    this.backendStore.saveUserProfile(options);
  }
}

export default GUIFrontendAcceptor;
