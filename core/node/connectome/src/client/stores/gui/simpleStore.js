class SimpleStore {
  constructor(initialState = {}) {
    this.state = initialState;

    this.subscriptions = [];
  }

  set(state) {
    this.state = state;
    Object.assign(this, state);
  }

  get() {
    return this.state;
  }

  clearState({ except = [] } = {}) {
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
