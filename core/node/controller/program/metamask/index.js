import path from 'path';
import dmt from 'dmt/bridge';

import readMetamaskDef from './readMetamaskDef';

class MetamaskStore {
  constructor() {
    this.peopleIdentities = [];

    const def = readMetamaskDef(path.join(dmt.userDir, 'def/metamask.def'));
    if (!def.empty) {
      this.peopleIdentities = def;
    }
  }

  getPersonIdentity(_address) {
    return this.peopleIdentities.find(({ address }) => address.toLowerCase() == _address.toLowerCase());
  }
}

export default MetamaskStore;
