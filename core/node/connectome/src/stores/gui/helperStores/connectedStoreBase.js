import MergeStore from './mergeStore';

class ConnectedStoreBase extends MergeStore {
  constructor(initialState = {}) {
    super(initialState);
  }

  set(state) {
    super.set(state, { ignore: ['connected'] });
  }

  setConnected(connected) {
    super.setMerge({ connected });
  }
}

export default ConnectedStoreBase;
