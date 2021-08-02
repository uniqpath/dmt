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

  get() {
    return this.parent.get(this.name) || {};
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
    this.parent.kvStore.removeSubKey({ baseKey: this.name, key });
    this.parent.announceStateChange(announce);
  }

  pushToArray(entry, { announce = true } = {}) {
    this.parent.kvStore.pushToArray(this.name, entry);
    this.parent.announceStateChange(announce);
  }

  removeFromArray(removePredicate, { announce = true } = {}) {
    this.parent.kvStore.removeFromArray(this.name, removePredicate);
    this.parent.announceStateChange(announce);
  }

  replaceArrayElement(selectorPredicate, value, { announce = true } = {}) {
    const foundMatch = this.parent.kvStore.replaceArrayElement(this.name, selectorPredicate, value);
    this.parent.announceStateChange(announce);
    return foundMatch;
  }

  updateArrayElement(selectorPredicate, value, { announce = true } = {}) {
    const foundMatch = this.parent.kvStore.updateArrayElement(this.name, selectorPredicate, value);
    this.parent.announceStateChange(announce);
    return foundMatch;
  }
}
