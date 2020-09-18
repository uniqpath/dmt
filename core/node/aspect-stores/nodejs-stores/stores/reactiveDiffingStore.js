import EventEmitter from 'events';

import { clone } from '../util';

import KeyValueStore from './twoLevelMergeKVStore';

import { saveState, readState } from './diffingStore/statePersist';

import removeStateChangeFalseTriggersFn from './diffingStore/removeStateChangeFalseTriggers';
import getDiff from './lib/getDiff';

class ReactiveDiffingStore extends EventEmitter {
  constructor({ initState, omitStateFn }) {
    super();

    this.kvStore = new KeyValueStore();

    this.prevAnnouncedState = {};

    const persistedState = readState();

    if (persistedState) {
      this.kvStore.update(persistedState, { announce: false });
    }
    this.kvStore.update(initState, { announce: false });

    this.omitStateFn = omitStateFn;

    this.stateChangesCount = 0;
  }

  update(patch, { announce = true } = {}) {
    this.kvStore.update(patch);
    this.announceStateChange(announce);
  }

  replaceSlot(slotName, value, { announce = true } = {}) {
    this.kvStore.replaceBaseKey(slotName, value);
    this.announceStateChange(announce);
  }

  clearSlot(slotName, { announce = true } = {}) {
    this.kvStore.clearBaseKey(slotName, { announce });
    this.announceStateChange(announce);
  }

  replaceSlotElement({ slotName, key, value }, { announce = true } = {}) {
    this.kvStore.replaceSubKey({ baseKey: slotName, key, value }, { announce });
    this.announceStateChange(announce);
  }

  removeSlotElement({ slotName, key }, { announce = true } = {}) {
    this.kvStore.removeSubKey({ baseKey: slotName, key }, { announce });
    this.announceStateChange(announce);
  }

  pushToSlotArrayElement(slotName, el, { announce = true } = {}) {
    this.kvStore.pushToArray(slotName, el, { announce });
    this.announceStateChange(announce);
  }

  removeFromSlotArrayElement(slotName, removePredicate, { announce = true } = {}) {
    this.kvStore.removeFromArray(slotName, removePredicate, { announce });
    this.announceStateChange(announce);
  }

  save() {
    this.lastSavedState = saveState({ state: this.kvStore.state, lastSavedState: this.lastSavedState }) || this.lastSavedState;
  }

  announceStateChange(announce = true) {
    if (!announce) {
      return;
    }

    const { state } = this.kvStore;

    const pruneState = state => removeStateChangeFalseTriggersFn(this.omitStateFn(state));

    const prunedState = pruneState(clone(state));

    const diff = getDiff({
      state: prunedState,
      prevAnnouncedState: this.prevAnnouncedState
    });

    if (diff) {
      this.save();

      this.emit('state_diff', { diff });

      this.stateChangesCount += 1;

      this.prevAnnouncedState = prunedState;
    }
  }
}

export default ReactiveDiffingStore;
