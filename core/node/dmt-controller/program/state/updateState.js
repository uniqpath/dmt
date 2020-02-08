import dmt from 'dmt-bridge';
const { util } = dmt;

function mergeState(state, patch) {
  return util.deepmerge(state, patch);
}

class UpdateState {
  updateState(patch, { announce = true } = {}) {
    this.program.state = mergeState(this.program.state, patch);

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }

  replaceState(replacement, { announce = true } = {}) {
    for (const key of Object.keys(replacement)) {
      this.program.state[key] = replacement[key];
    }

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }

  replaceStoreElement({ storeName, key, value }, { announce = true } = {}) {
    this.program.state[storeName] = this.program.state[storeName] || {};
    this.program.state[storeName][key] = value;

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }

  removeStoreElement({ storeName, key }, { announce = true } = {}) {
    this.program.state[storeName] = this.program.state[storeName] || {};
    delete this.program.state[storeName][key];

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }

  pushToStateArray(key, el, { announce = true } = {}) {
    this.program.state = mergeState(this.program.state, {});
    this.program.state[key].push(el);

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }

  removeFromStateArray(key, removePredicate, { announce = true } = {}) {
    this.program.state = mergeState(this.program.state, {});
    this.program.state[key] = this.program.state[key].filter(el => !removePredicate(el));

    if (!this.initStatePhase && announce) {
      this.announceStateChange();
    }
  }
}

export default UpdateState;
