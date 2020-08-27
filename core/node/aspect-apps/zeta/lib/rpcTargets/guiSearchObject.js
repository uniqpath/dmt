import dmt from 'dmt/bridge';
import { parseSearchQuery, serializeContentRefs } from 'dmt/search';
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
          console.log('GUISearchObject error:');
          console.log(error);
        });
    });
  }

  trackClick({ url, clickMetadata }) {
    this.program.emit('zeta::link_click', { url, clickMetadata });
  }
}

export default GUISearchObject;
