import EventEmitter from 'events';

class Store extends EventEmitter {
  constructor() {
    super();

    this.state = {};

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
