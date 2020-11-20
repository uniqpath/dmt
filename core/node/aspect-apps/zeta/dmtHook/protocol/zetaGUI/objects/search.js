import dmt from 'dmt/bridge';
import { push } from 'dmt/notify';

import { parseSearchQuery, serializeContentRefs } from 'dmt/search';
import { fiberHandle } from 'dmt/connectome-next';

const { log } = dmt;

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, searchMode, searchMetadata }) {
    const { searchOriginHost } = searchMetadata;

    console.log(`searchMode: ${searchMode}`);

    return new Promise(success => {
      const { terms, mediaType, count, page, atDevices } = parseSearchQuery({ query });

      let providers = '';

      if (atDevices.length > 0 && dmt.isDevMachine()) {
        providers = serializeContentRefs(atDevices);
      } else {
        const thisProviders = ['this'];

        let peers = [];
        if (searchMode == 0) {
          peers = this.program.peerlist().filter(peer => peer != searchOriginHost);
        }

        providers = thisProviders
          .concat(peers)
          .map(provider => `@${provider} @${provider}/links @${provider}/swarm`)
          .join(' ');
      }

      this.program
        .actor('search')
        .call('search', { query: `${terms.join(' ')} ${providers} @count=20`, searchOriginHost })
        .then(responses => {
          const totalHits = responses.filter(res => res.results).reduce((totalHits, res) => totalHits + res.results.length, 0);
          this.program.emit('zeta::user_search', { query, totalHits, searchMetadata });
          success(responses);
        })
        .catch(error => {
          log.yellow('GUISearchObject error:');
          log.yellow(error);
        });
    });
  }

  browsePlace({ place, searchMetadata }) {
    const { searchOriginHost } = searchMetadata;

    return new Promise(success => {
      const count = 500;
      const page = 'TODO!';

      this.program
        .actor('search')
        .call('search', { query: `@count=${count}`, place, searchOriginHost })
        .then(responses => {
          const totalHits = responses.filter(res => res.results).reduce((totalHits, res) => totalHits + res.results.length, 0);
          this.program.emit('zeta::user_search', { query: `place: ${fiberHandle.decode(place)}`, totalHits, searchMetadata });
          success(responses);
        })
        .catch(error => {
          log.yellow('GUISearchObject error:');
          log.yellow(error);
        });
    });
  }

  trackClick({ url, clickMetadata }) {
    this.program.emit('zeta::link_click', { url, clickMetadata });
  }
}

export default GUISearchObject;
