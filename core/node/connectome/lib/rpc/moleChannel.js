import { EventEmitter } from '../utils/index.js';

class Channel extends EventEmitter {
  constructor(connector) {
    super();

    this.connector = connector;
  }

  send(...args) {
    this.connector.send(...args);
  }
}

export default Channel;
