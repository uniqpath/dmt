import fastJsonPatch from 'fast-json-patch';

import WritableStore from '../../stores/lib/helperStores/writableStore.js';

const { applyPatch: applyJSONPatch } = fastJsonPatch;

export default class protocolState extends WritableStore {
  constructor(connector) {
    super({});

    this.connector = connector;

    // Special incoming JSON message: { state: ... } ... parsed as part of 'Connectome State Syncing Protocol'
    this.connector.on('receive_state', state => {
      this.wireStateReceived = true;

      this.set(state);
    });

    // Special incoming JSON message: { diff: ... } ... parsed as part of 'Connectome State Syncing Protocol'
    this.connector.on('receive_diff', diff => {
      if (this.wireStateReceived) {
        applyJSONPatch(this.state, diff);
        this.announceStateChange();
      }
    });
  }

  field(name) {
    return this.connector.connectionState.get(name);
  }
}
