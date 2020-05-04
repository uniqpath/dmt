import dmt from 'dmt/bridge';
import { parseArgs, serializeContentRefs } from 'dmt/search';
import getContentProviders from '../getContentProviders';

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, searchOriginHost }) {
    return new Promise(success => {
      const { terms, mediaType, clientMaxResults, page, atDevices } = parseArgs({ args: query });

      let providers = '';

      if (atDevices.length > 0 && dmt.isDevMachine()) {
        providers = serializeContentRefs(atDevices);
      } else {
        providers = getContentProviders().join(' ');
      }

      this.program
        .actor('search')
        .call('search', { query: `${terms} ${providers} @count=10`, searchOriginHost })
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
