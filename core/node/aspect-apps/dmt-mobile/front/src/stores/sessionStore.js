import { newKeypair } from 'dmt/connectome';
import { stores } from 'dmt-js';
const { SimpleStore } = stores;

class SessionStore extends SimpleStore {
  constructor() {
    super();

    this.constructOurKeypair();
  }

  constructOurKeypair() {
    this.set(newKeypair());
  }
}

export default SessionStore;
