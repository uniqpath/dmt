import mergeState from './lib/merge.js';

export default class KeyValueStore {
  constructor() {
    this.state = {};
  }

  set(state) {
    this.state = state;
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
    const found = this.state[baseKey][key] != undefined;
    delete this.state[baseKey][key];
    return found;
  }

  push(baseKey, value) {
    this.state[baseKey].push(value);
  }

  updateArrayElements(baseKey, selectorPredicate, value) {
    let hasUpdated;

    for (const entry of this.state[baseKey].filter(entry => selectorPredicate(entry))) {
      Object.assign(entry, value);
      hasUpdated = true;
    }

    return hasUpdated;
  }

  removeArrayElements(baseKey, removePredicate) {
    const prevLength = this.state[baseKey].length;
    this.state[baseKey] = this.state[baseKey].filter(entry => !removePredicate(entry));
    return prevLength != this.state[baseKey].length;
  }

  replaceArrayElement(baseKey, selectorPredicate, value) {
    const entry = this.state[baseKey].find(entry => selectorPredicate(entry));

    if (entry) {
      Object.keys(entry).forEach(key => delete entry[key]);
      Object.assign(entry, value);
      return true;
    }
  }

  sortArray(baseKey, compareFn) {
    this.state[baseKey].sort(compareFn);
  }
}
