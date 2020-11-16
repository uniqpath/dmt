import Emitter from '../../utils/emitter/index.js';

class SimpleStore extends Emitter {
  constructor(initialState = {}) {
    super();

    this.state = initialState;

    this.subscriptions = [];
  }

  set(state) {
    Object.assign(this.state, state);

    Object.assign(this, this.state);

    this.pushStateToSubscribers();
  }

  get() {
    return this.state;
  }

  clearState({ except }) {
    for (const key of Object.keys(this.state)) {
      if (!except.includes(key)) {
        delete this[key];
        delete this.state[key];
      }
    }
  }

  subscribe(handler) {
    this.subscriptions.push(handler);
    handler(this.state);
    return () => {
      this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
    };
  }

  pushStateToSubscribers() {
    this.subscriptions.forEach(handler => handler(this.state));
  }
}

export default SimpleStore;
