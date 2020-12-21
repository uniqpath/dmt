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
    const { searchOriginHost, isLAN } = searchMetadata;

    console.log(`searchMode: ${searchMode}`);

    return new Promise(success => {
      const { terms, mediaType, count, page, atDevices } = parseSearchQuery({ query });

      const peerlist = searchMode == 0 ? this.program.peerlist() : [];
      const peerAddresses = peerlist.length > 0 ? peerlist.map(({ address }) => address) : [];

      const providers = ['this']
        .concat(peerAddresses)
        .map(provider => `@${provider} @${provider}/links`)
        .join(' ');
      this.program
        .actor('search')
        .call('search', { query: `${terms.join(' ')} ${providers} @count=20`, searchOriginHost })
        .then(responses => {
          for (const response of responses) {
            const { meta } = response;
            if (meta) {
              const matchingPeer = peerlist.find(({ address }) => address == meta.providerAddress);
              if (matchingPeer) {
                meta.providerTag = matchingPeer.deviceTag;
              } else {
                meta.thisMachine = true;

                if (isLAN) {
                  meta.providerTag = meta.providerHost;
                } else {
                  meta.providerTag = 'this';
                }
              }
            }
          }

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
