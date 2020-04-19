import { newKeypair } from 'connectome';
import SimpleStore from './simpleStore';

class SessionStore extends SimpleStore {
  constructor({ verbose = false } = {}) {
    super();

    this.verbose = verbose;

    this.constructOurKeypair();
  }

  constructOurKeypair() {
    const keypair = newKeypair();
    this.set(keypair);

    if (this.verbose) {
      console.log('Constructed new client keypair:');
      console.log(`Private key: ${keypair.privateKeyHex}`);
      console.log(`Public key: ${keypair.publicKeyHex}`);
    }
  }
}

export default SessionStore;
