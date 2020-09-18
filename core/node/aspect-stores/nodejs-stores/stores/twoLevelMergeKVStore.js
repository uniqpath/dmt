import mergeState from './lib/merge';

class KeyValueStore {
  constructor() {
    this.state = {};
  }

  update(patch) {
    this.state = mergeState(this.state, patch);
  }

  replaceBaseKey(baseKey, value) {
    this.state[baseKey] = value;
  }

  clearBaseKey(baseKey) {
    delete this.state[baseKey];
  }

  replaceSubKey({ baseKey, key, value }) {
    this.state[baseKey] = this.state[baseKey] || {};
    this.state[baseKey][key] = value;
  }

  removeSubKey({ baseKey, key }) {
    this.state[baseKey] = this.state[baseKey] || {};
    delete this.state[baseKey][key];
  }

  pushToArray(baseKey, el) {
    this.state[baseKey].push(el);
  }

  removeFromArray(baseKey, removePredicate) {
    this.state[baseKey] = this.state[baseKey].filter(el => !removePredicate(el));
  }
}

export default KeyValueStore;
