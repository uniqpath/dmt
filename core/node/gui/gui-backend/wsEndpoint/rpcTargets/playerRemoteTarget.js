import EventEmitter from 'events';

class PlayerTarget extends EventEmitter {
  constructor({ program }) {
    super();
    this.program = program;
  }

  action(action, args) {
    return new Promise((success, reject) => {
      this.program
        .actor('player')
        .call(action, args)
        .then(success)
        .catch(reject);
    });
  }

  search({ query }) {
    console.log(`RECEIVED QUERY: ${query}`);
    return this.action('search', query);
  }

  add({ query }) {
    return this.action('add', query);
  }

  insert({ query }) {
    return this.action('insert', query);
  }

  play({ query }) {
    return this.action('play', query);
  }

  gather({ query }) {
    return this.action('gather', query);
  }
}

export default PlayerTarget;
