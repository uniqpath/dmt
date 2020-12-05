import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

const { log } = dmt;

class GUIFrontendAcceptor {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  getUserIdentity({ ethAddress, urlHostname }) {
    return 'MOOO';

    if (!ethAddress) {
      push.notify('WARNING: getUserIdentity called with empty address');
    }

    if (urlHostname != 'localhost') {
      log.write(`Login with ${ethAddress}`);
    }
  }

  emitProgramEvent(name, data) {
    this.program.emit(name, data);
  }

  saveUserProfile(options) {
    this.backendStore.saveUserProfile(options);
  }
}

export default GUIFrontendAcceptor;
