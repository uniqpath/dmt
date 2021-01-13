import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

const { log } = dmt;

class GUIFrontendAcceptor {
  constructor({ program, channel }) {
    this.program = program;
    //this.backendStore = backendStore;
    this.channel = channel;
  }

  getUserIdentity({ ethAddress, urlHostname }) {
    return 'MOOO';

    if (!ethAddress) {
      push.notify('WARNING: getUserIdentity called with empty address');
    }

    if (urlHostname != 'localhost') {
      log.write(`Login with ${ethAddress}`);
      //push.notify(address);
    }

    //return this.backendStore.getUserIdentity(ethAddress);
  }

  emitProgramEvent(name, data) {
    this.program.emit(name, data);
  }

  // TODO: clear up a little bit -- userIdentity is our fixed identity from .def file
  // userName is user set ...

  saveUserProfile(options) {
    //console.log(`Saving user profile: ${userName} -- ${userEmail}`);
    this.backendStore.saveUserProfile(options);
  }
}

export default GUIFrontendAcceptor;
