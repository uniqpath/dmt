import dmt from 'dmt-bridge';
import stopwatch from 'pretty-hrtime';

import ProviderSearch from './providerSearch';
import contentSearch from './contentSearch';
const { log } = dmt;

const { Fanout } = dmt.connectome;

class SearchClient {
  constructor(providers, { mediaType } = {}) {
    this.providers = providers.map(provider => Object.assign(provider, { providerAddress: dmt.hostAddress(provider) }));

    const port = 7780;
    const protocol = 'dmt';
    const protocolLane = 'fiber';

    const keypair = dmt.keypair();
    if (!keypair) {
      console.log('Missing keypair, not connecting fibers...');
      return;
    }

    const localProviders = dmt.util.listify(providers).filter(provider => provider.localhost);
    const remoteProviders = dmt.util.listify(providers).filter(provider => !provider.localhost);

    this.searchArray = localProviders.map(provider => new ProviderSearch({ provider, mediaType }));

    const addressList = [
      ...new Set(
        remoteProviders.map(provider => {
          return provider.providerAddress;
        })
      )
    ];

    const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = keypair;

    this.fanout = new Fanout({ addressList, protocol, protocolLane, port, clientPrivateKey, clientPublicKey });

    this.fanout.connect().then(connectors => {
      for (const provider of remoteProviders) {
        const connector = connectors.find(({ address }) => provider.providerAddress == address);
        if (connector) {
          this.searchArray.push(new ProviderSearch({ provider, mediaType, connector }));
        } else {
          throw new Error(`Connector with address ${provider.providerAddress} couldn't be found -- shouldn't happen`);
        }
      }
    });
  }

  async search({ terms, clientMaxResults, mediaType, contentRef }) {
    return new Promise((success, reject) => {
      const options = { terms, clientMaxResults, mediaType, contentRef };
      log.debug('Searching providers', { obj: this.providers });
      log.debug('with options', { obj: options });

      const promises = this.searchArray.map(providerSearch => providerSearch.search(options));

      Promise.all(promises)
        .then(allResults => {
          log.debug('All results from search client', { obj: allResults });

          success(allResults);
        })
        .catch(reject);
    });
  }
}

export default SearchClient;
