import dmt from 'dmt/bridge';

import SimpleStore from './simpleStore';

import identifyUser from './identifyUser';

class BackendStore extends SimpleStore {
  constructor({ program, verbose = false } = {}) {
    super();

    this.program = program;
    this.verbose = verbose;

    const deviceName = dmt.device({ onlyBasicParsing: true }).id;

    this.set({ deviceName });

    this.userSessions = {};
  }

  getUserIdentity(ethAddress) {
    ethAddress = ethAddress.toLowerCase();

    if (!this.userSessions[ethAddress]) {
      this.userSessions[ethAddress] = identifyUser({ program: this.program, ethAddress });
    }

    const { userIdentity, isAdmin } = this.userSessions[ethAddress];

    if (userIdentity) {
      return { userIdentity, isAdmin };
    }

    return { userIdentity: null, isAdmin: null };
  }
}

export default BackendStore;
