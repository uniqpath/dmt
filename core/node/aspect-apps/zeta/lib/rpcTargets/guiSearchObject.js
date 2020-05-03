import getContentProviders from '../getContentProviders';

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, searchOriginHost }) {
    return new Promise(success => {
      const providers = getContentProviders();

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
