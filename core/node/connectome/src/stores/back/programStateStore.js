import { EventEmitter } from '../../utils/index.js';

import clone from './lib/clone.js';

import KeyValueStore from './twoLevelMergeKVStore.js';

import getDiff from './lib/getDiff.js';

class ProgramStateStore extends EventEmitter {
  constructor(initialState = {}, { loadState = null, saveState = null, omitStateFn = x => x, removeStateChangeFalseTriggers = x => x } = {}) {
    super();

    this.omitStateFn = omitStateFn;
    this.saveState = saveState;
    this.removeStateChangeFalseTriggers = removeStateChangeFalseTriggers;

    this.kvStore = new KeyValueStore();

    this.prevAnnouncedState = {};

    if (loadState) {
      const persistedState = loadState();

      if (persistedState) {
        this.kvStore.update(persistedState, { announce: false });
      }
    }
    this.kvStore.update(initialState, { announce: false });

    this.stateChangesCount = 0;

    this.subscriptions = [];
  }

  mirror(channelList) {
    channelList.on('new_channel', channel => {
      const state = this.omitStateFn(clone(this.state()));
      channel.send({ state });
    });

    this.on('diff', diff => {
      channelList.sendToAll({ diff });
    });
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

  save(state) {
    if (this.saveState) {
      this.lastSavedState = this.saveState({ state: clone(state), lastSavedState: this.lastSavedState }) || this.lastSavedState;
    }
  }

  state() {
    return this.kvStore.state;
  }

  announceStateChange(announce = true) {
    if (!announce) {
      return;
    }

    const { state } = this.kvStore;

    const prunedState = this.removeStateChangeFalseTriggers(this.omitStateFn(clone(state)));

    const diff = getDiff(this.prevAnnouncedState, prunedState);

    if (diff) {
      this.save(state);

      this.emit('diff', diff);

      this.stateChangesCount += 1;

      this.prevAnnouncedState = prunedState;

      this.pushStateToSubscribers();
    }
  }

  subscribe(handler) {
    this.subscriptions.push(handler);
    handler(this.state());
    return () => {
      this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
    };
  }

  pushStateToSubscribers() {
    this.subscriptions.forEach(handler => handler(this.state()));
  }
}

export default ProgramStateStore;
