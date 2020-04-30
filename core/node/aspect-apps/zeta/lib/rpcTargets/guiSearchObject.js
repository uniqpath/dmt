import dmt from 'dmt/bridge';

import { push } from 'dmt/notify';

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, searchOriginHost }) {
    return new Promise((success, reject) => {
      const providers = ['@134.122.75.242:7780'];

      if (dmt.isDevMachine()) {
        providers.push('@solar/music');
      }

      this.program
        .actor('search')
        .call('search', { query: `${providers.join(' ')} ${query} @count=10`, searchOriginHost })
        .then(response => {
          if (dmt.device().id == 'zeta') {
            push.notify(`ZetaSeek: ${query}, results count: ${response[0].results.length}`);
          }
          success(response);
        })
        .catch(error => {
          console.log('Search error:');
          console.log(error);
        });
    });
  }
}

export default GUISearchObject;
