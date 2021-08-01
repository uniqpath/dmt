import { EventEmitter } from '../../utils/index.js';

import clone from './lib/clone.js';

import getDiff from './lib/getDiff.js';

class MirroringStore extends EventEmitter {
  constructor(initialState = {}) {
    super();

    this.state = initialState;
    this.lastAnnouncedState = clone(initialState);
  }

  mirror(channelList) {
    channelList.on('new_channel', channel => {
      channel.send({ state: this.lastAnnouncedState });
    });

    this.on('diff', diff => {
      channelList.sendAll({ diff });
    });
  }

  set(state, { announce = true } = {}) {
    this.state = state;
    this.announceStateChange(announce);
  }

  update(patch, { announce = true } = {}) {
    this.state = { ...this.state, ...patch };
    this.announceStateChange(announce);
  }

  get() {
    return this.state;
  }

  announceStateChange(announce = true) {
    if (!announce) {
      return;
    }

    const { state } = this;

    const diff = getDiff(this.lastAnnouncedState, state);

    if (diff) {
      this.emit('diff', diff);

      this.lastAnnouncedState = clone(state);
    }
  }
}

export default MirroringStore;
