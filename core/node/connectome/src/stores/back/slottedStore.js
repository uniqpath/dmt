import { EventEmitter } from '../../utils/index.js';

import clone from './lib/clone.js';

import KeyValueStore from './twoLevelMergeKVStore.js';

import Slot from './slot';

import getDiff from './lib/getDiff.js';

import removeVolatileElements from './removeVolatileElements';
import muteAnnounce from './muteAnnounce';

export default class SlottedStore extends EventEmitter {
  constructor(initialState = {}, { loadState = null, saveState = null, omitStateFn = x => x } = {}) {
    super();

    this.omitStateFn = omitStateFn;
    this.saveState = saveState;

    this.slots = {};
    this.kvStore = new KeyValueStore();

    if (loadState) {
      const persistedState = loadState();

      if (persistedState) {
        this.kvStore.update(removeVolatileElements(this.slots, persistedState));
      }
    }

    this.kvStore.update(initialState);

    this.lastAnnouncedState = this.omitAndCloneState();

    this.stateChangesCount = 0;

    this.subscriptions = [];
  }

  syncOver(channelList) {
    this.channelList = channelList;

    channelList.on('new_channel', channel => {
      channel.send({ state: this.lastAnnouncedState });
    });
  }

  sendRemote({ state, diff }) {
    if (this.channelList) {
      this.channelList.sendAll({ state, diff });
    }
  }

  state() {
    return this.kvStore.state;
  }

  get(key) {
    return key ? this.state()[key] : this.state();
  }

  omitAndCloneState() {
    return this.omitStateFn(clone(this.state()));
  }

  slot(name) {
    if (!this.slots[name]) {
      this.slots[name] = new Slot({ name, parent: this });
    }

    return this.slots[name];
  }

  update(patch, { announce = true, skipDiffing = false } = {}) {
    this.kvStore.update(patch);
    this.announceStateChange(announce, skipDiffing);
  }

  save() {
    if (this.saveState) {
      const state = removeVolatileElements(this.slots, clone(this.state()));
      const savedState = this.saveState({ state, lastSavedState: this.lastSavedState });

      if (savedState) {
        this.lastSavedState = savedState;
      }
    }
  }

  announceStateChange(announce = true, skipDiffing = false) {
    if (!announce) {
      return;
    }

    const remoteState = this.omitAndCloneState();

    if (skipDiffing) {
      this.sendRemote({ state: remoteState });
      this.tagState({ state: remoteState });
      return;
    }

    const diff = getDiff(this.lastAnnouncedState, muteAnnounce(this.slots, remoteState));

    if (diff) {
      this.sendRemote({ diff });
      this.stateChangesCount += 1;
      this.tagState({ state: remoteState });
    }
  }

  tagState({ state }) {
    this.save();
    this.lastAnnouncedState = state;
    this.pushStateToLocalSubscribers();
  }

  subscribe(handler) {
    this.subscriptions.push(handler);

    handler(this.state());

    return () => {
      this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
    };
  }

  pushStateToLocalSubscribers() {
    this.subscriptions.forEach(handler => handler(this.state()));
  }
}
