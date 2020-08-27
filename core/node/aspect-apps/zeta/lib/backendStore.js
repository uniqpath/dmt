import dmt from 'dmt/bridge';

import fs from 'fs';
import os from 'os';
const { homedir } = os;

import FileStore from './fileStore';

import SimpleStore from './simpleStore';

import identifyUser from './identifyUser';

import ZetaBalances from './zetaBalances/zetaBalances';

class BackendStore extends SimpleStore {
  constructor({ program, verbose = false } = {}) {
    super();

    this.program = program;
    this.verbose = verbose;

    this.tokenBalances = new ZetaBalances();

    const dir = `${homedir()}/.dmt-user-profiles`;

    if (fs.existsSync(dir)) {
      this.fileStore = new FileStore({ dir });
    }

    const deviceName = dmt.device({ onlyBasicParsing: true }).id;

    const { player } = program.state;

    this.set({ deviceName, player });

    this.userSessions = {};
  }

  getUserIdentity(ethAddress) {
    ethAddress = ethAddress.toLowerCase();

    const data = {};

    data.tokenBalance = this.tokenBalances.getBalance(ethAddress);

    if (this.fileStore) {
      Object.assign(data, this.fileStore.readUserProfile(ethAddress));
    }

    if (!this.userSessions[ethAddress]) {
      this.userSessions[ethAddress] = identifyUser({ program: this.program, ethAddress });
    }

    const { userIdentity, isAdmin, teams } = this.userSessions[ethAddress];

    const teamsArray = teams ? teams.split(',').map(team => team.toLowerCase().trim()) : [];

    if (userIdentity) {
      return { ...data, ...{ userIdentity, isAdmin, userTeams: teamsArray } };
    }

    const blankData = { userName: null, userEmail: null, userIdentity: null, isAdmin: null, userTeams: null, tokenBalance: { value: 0 } };

    return { ...blankData, ...data };
  }

  saveUserProfile(options) {
    if (this.fileStore) {
      this.fileStore.saveUserProfile(options);
    }
  }
}

export default BackendStore;
