import mergeState from './lib/merge.js';

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

  pushToArray(baseKey, value) {
    this.state[baseKey].push(value);
  }

  removeFromArray(baseKey, removePredicate) {
    this.state[baseKey] = this.state[baseKey].filter(entry => !removePredicate(entry));
  }

  replaceArrayElement(baseKey, selectorPredicate, value) {
    const entry = this.state[baseKey].find(entry => selectorPredicate(entry));

    if (entry) {
      Object.keys(entry).forEach(key => delete entry[key]);
      Object.assign(entry, value);
      return true;
    }
  }

  updateArrayElement(baseKey, selectorPredicate, value) {
    const entry = this.state[baseKey].find(entry => selectorPredicate(entry));

    if (entry) {
      Object.assign(entry, value);
      return true;
    }
  }
}

export default KeyValueStore;
