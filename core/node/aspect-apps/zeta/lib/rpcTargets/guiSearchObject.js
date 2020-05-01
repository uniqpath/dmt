import dmt from 'dmt/bridge';

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, searchOriginHost }) {
    return new Promise((success, reject) => {
      const providers = [];

      if (dmt.isDevMachine()) {
        providers.push('@this/swarm');
        providers.push('@solar');
      } else {
        providers.push('@134.122.75.242:7780/swarm');
      }

      providers.push(...['@134.122.75.242:7780', '@this']);

      this.program
        .actor('search')
        .call('search', { query: `${providers.join(' ')} ${query} @count=10`, searchOriginHost })
        .then(response => {
          success(response);
        })
        .catch(error => {
          console.log('GUISearchObject error:');
          console.log(error);
        });
    });
  }
}

export default GUISearchObject;
