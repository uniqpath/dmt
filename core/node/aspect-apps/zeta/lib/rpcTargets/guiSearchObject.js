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
        .call('search', { query: `${providers.join(' ')} @count=10 ${query}`, searchOriginHost })
        .then(responses => {
          const totalHits = responses.filter(res => res.results).reduce((totalHits, res) => totalHits + res.results.length, 0);
          this.program.emit('zeta::user_search', { query, totalHits });
          success(responses);
        })
        .catch(error => {
          console.log('GUISearchObject error:');
          console.log(error);
        });
    });
  }
}

export default GUISearchObject;
