import Emitter from '../emitter';

class Channel extends Emitter {
  constructor(connector) {
    super();

    this.connector = connector;
  }

  send(...args) {
    this.connector.send(...args);
  }
}

export default Channel;
