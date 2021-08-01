import ReadableStore from './readableStore';

class WritableStore extends ReadableStore {
  set(state) {
    this.state = state;
    this.announceStateChange();
  }
}

export default WritableStore;
