import ReadableStore from './readableStore.js';

export default class WritableStore extends ReadableStore {
  set(state) {
    this.state = state;
    this.announceStateChange();
  }
}
