import Emitter from '../utils/emitter/index.js';

class Store extends Emitter {
  constructor() {
    super();

    this.state = {};

    this.subscriptions = [];
  }

  set(state, { announce = true } = {}) {
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

  subscribe(callback) {
    const subscriptionId = Math.random();

    this.subscriptions.push({ subscriptionId, callback });

    callback(this.state);

    return () => {
      this.subscriptions.forEach((el, index) => {
        if (el.subscriptionId == subscriptionId) {
          this.subscriptions.splice(index, 1);
        }
      });
    };
  }

  pushStateToSubscribers() {
    this.subscriptions.forEach(sub => sub.callback(this.state));
  }
}

export default Store;
