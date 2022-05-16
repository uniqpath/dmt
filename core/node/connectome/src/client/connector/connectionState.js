import WritableStore from '../../stores/lib/helperStores/writableStore.js';

export default class connectionState extends WritableStore {
  constructor(connector) {
    super({});

    this.fields = {};

    this.connector = connector;

    this.connector.on('receive_state_field', ({ name, state }) => {
      this.get(name).set(state);
    });
  }

  get(name) {
    if (!this.fields[name]) {
      this.fields[name] = new WritableStore();
    }

    return this.fields[name];
  }
}
