import Emitter from '../../../utils/emitter/index.js';

// 💡 we use Emitter inside ConnectedStore to emit 'ready' event
// 💡 and inside MultiConnectedStore to also emit a few events

class WritableStore extends Emitter {
  constructor(initialState) {
    super();

    this.state = initialState;

    this.subscriptions = [];
  }

  set(state) {
    this.state = state;

    this.pushStateToSubscribers();
  }

  get() {
    return this.state;
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

export default WritableStore;
