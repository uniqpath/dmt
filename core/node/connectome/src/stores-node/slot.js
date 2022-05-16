export default class Slot {
  constructor({ name, parent }) {
    this.name = name;
    this.parent = parent;
  }

  makeArray() {
    if (!Array.isArray(this.get())) {
      this.set([], { announce: false });
    }
    return this;
  }

  muteAnnounce(callback) {
    this._muteAnnounce = true;
    this.muteAnnounceCallback = callback;
  }

  mutesAnnounce() {
    return this._muteAnnounce;
  }

  get(key) {
    const slotState = this.parent.get(this.name) || {};
    return key ? slotState[key] : slotState;
  }

  set(state, { announce = true } = {}) {
    this.parent.kvStore.replaceBaseKey(this.name, state);
    this.parent.announceStateChange(announce);
  }

  update(patch, { announce = true } = {}) {
    const _patch = {};
    _patch[this.name] = patch;
    this.parent.update(_patch, { announce });
  }

  remove({ announce = true } = {}) {
    this.parent.kvStore.clearBaseKey(this.name);
    this.parent.announceStateChange(announce);
  }

  removeKey(key, { announce = true } = {}) {
    if (this.parent.kvStore.removeSubKey({ baseKey: this.name, key })) {
      this.parent.announceStateChange(announce);
    }
  }

  removeKeys(keys, { announce = true } = {}) {
    for (const key of keys) {
      this.parent.kvStore.removeSubKey({ baseKey: this.name, key });
    }
    this.parent.announceStateChange(announce);
  }

  push(element, { announce = true } = {}) {
    this.parent.kvStore.push(this.name, element);
    this.parent.announceStateChange(announce);
  }

  updateArrayElements(selectorPredicate, value, { announce = true } = {}) {
    const foundMatches = this.parent.kvStore.updateArrayElements(this.name, selectorPredicate, value);
    if (foundMatches) {
      this.parent.announceStateChange(announce);
    }
  }

  removeArrayElements(selectorPredicate, { announce = true } = {}) {
    const removed = this.parent.kvStore.removeArrayElements(this.name, selectorPredicate);
    this.parent.announceStateChange(removed && announce);
  }

  replaceArrayElement(selectorPredicate, value, { announce = true } = {}) {
    const foundMatch = this.parent.kvStore.replaceArrayElement(this.name, selectorPredicate, value);
    if (foundMatch) {
      this.parent.announceStateChange(announce);
      return true;
    }
  }

  setArrayElement(selectorPredicate, value, { announce = true } = {}) {
    if (!this.replaceArrayElement(selectorPredicate, value, { announce })) {
      this.push(value, { announce });
    }
  }

  sortArray(compareFn, { announce = true }) {
    this.parent.kvStore.sortArray(this.name, compareFn);
    this.parent.announceStateChange(announce);
  }
}
