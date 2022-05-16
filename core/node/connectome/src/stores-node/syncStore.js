import { EventEmitter, stopwatch } from '../utils/index.js';

import clone from './lib/clone.js';

import KeyValueStore from './twoLevelMergeKVStore.js';

import Slot from './slot';

import getDiff from './lib/getDiff.js';

import removeUnsaved from './removeUnsaved';
import muteAnnounce from './muteAnnounce';

import { saveState, loadState } from './statePersist';
export default class SyncStore extends EventEmitter {
  constructor(
    initialState = {},
    {
      stateFilePath,
      unsavedSlots = [],
      beforeLoadAndSave = state => state,
      schemaVersion,
      schemaMigrations = [],
      noRecovery = false,
      omitStateFn = state => state
    } = {}
  ) {
    super();

    this.stateFilePath = stateFilePath;
    this.unsavedSlots = unsavedSlots;
    this.beforeLoadAndSave = beforeLoadAndSave;
    this.schemaVersion = schemaVersion;
    this.omitStateFn = omitStateFn;

    this.slots = {};
    this.kvStore = new KeyValueStore();

    if (this.stateFilePath) {
      const persistedState = loadState({ schemaVersion, stateFilePath, schemaMigrations, noRecovery });

      if (persistedState) {
        this.kvStore.update(removeUnsaved(persistedState, unsavedSlots, beforeLoadAndSave));
      }
    }

    this.kvStore.update(initialState);

    this.lastAnnouncedState = this.omitAndCloneState();

    this.stateChangesCount = 0;

    this.subscriptions = [];
  }

  sync(channelList) {
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

  key(name) {
    return this.slot(name);
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
    if (this.stateFilePath) {
      const state = removeUnsaved(clone(this.state()), this.unsavedSlots, this.beforeLoadAndSave);
      const savedState = saveState({
        stateFilePath: this.stateFilePath,
        schemaVersion: this.schemaVersion,
        state,
        lastSavedState: this.lastSavedState
      });

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

    const start = stopwatch.start();

    const diff = getDiff(this.lastAnnouncedState, muteAnnounce(this.slots, remoteState));

    const duration = stopwatch.stop(start);
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
