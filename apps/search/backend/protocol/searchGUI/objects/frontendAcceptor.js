import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

const { log } = dmt;

class GUIFrontendAcceptor {
  constructor({ program, channel }) {
    this.program = program;
    //this.backendStore = backendStore;
    this.channel = channel;
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
