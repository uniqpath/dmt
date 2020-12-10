import WritableStore from './writableStore';

class MergeStore extends WritableStore {
  constructor(initialState = {}) {
    super(initialState);
  }

  set(state, { ignore = [] } = {}) {
    const leaveState = {};

    for (const key of ignore) {
      leaveState[key] = this.state[key];
    }

    super.set({ ...state, ...leaveState });
  }

  setMerge(patch) {
    super.set({ ...this.state, ...patch });
  }

  clearState({ except = [] } = {}) {
    for (const key of Object.keys(this.state)) {
      if (!except.includes(key)) {
        delete this.state[key];
      }
    }
  }
}

export default MergeStore;
