import ReadableStore from './readableStore';

export default class WritableStore extends ReadableStore {
  set(state) {
    this.state = state;
    this.announceStateChange();
  }
}
