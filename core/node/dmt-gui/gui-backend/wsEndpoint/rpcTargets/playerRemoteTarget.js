import EventEmitter from 'events';

import dmt from 'dmt-bridge';

class PlayerTarget extends EventEmitter {
  constructor({ program }) {
    super();
    this.program = program;
  }

  action(action, args) {
    return new Promise((success, reject) => {
      this.program.metaRPC
        .call('player', action, args)
        .then(success)
        .catch(reject);
    });
  }

  search(args) {
    return this.action('search', args);
  }

  add(args) {
    return this.action('add', args);
  }

  insert(args) {
    return this.action('insert', args);
  }

  play(args) {
    return this.action('play', args);
  }
}

export default PlayerTarget;
