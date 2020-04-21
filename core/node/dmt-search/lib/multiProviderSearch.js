import dmt from 'dmt-bridge';

const { stopwatch } = dmt;

import LocalProviderSearch from './localProviderSearch';
import RemoteProviderSearch from './remoteProviderSearch';

const { log, util } = dmt;

class MultiProviderSearch {
  constructor({ program, providers, mediaType } = {}) {
    this.program = program;

    const providerList = util.listify(providers).map(provider => Object.assign(provider, { providerAddress: dmt.hostAddress(provider) }));

    const localProviders = providerList.filter(provider => provider.localhost);
    this.localProvidersCount = localProviders.length;

    const remoteProviders = providerList.filter(provider => !provider.localhost);
    this.remoteProvidersCount = remoteProviders.length;

    this.searchArray = localProviders.map(provider => {
      return new LocalProviderSearch({ provider, mediaType });
    });

    remoteProviders.forEach(provider => {
      const start = stopwatch.start();

      program.fiberPool.getFiber(provider.providerAddress).then(connector => {
        this.searchArray.push(new RemoteProviderSearch({ provider, mediaType, connector }));
      });
    });
  }

  async search(options) {
    return new Promise((success, reject) => {
      if (this.remoteProvidersCount + this.localProvidersCount == this.searchArray.length) {
        const searches = this.searchArray.map(providerSearch => providerSearch.search(options));

        Promise.all(searches)
          .then(allResults => {
            log.debug('All results from search client', { obj: allResults });

            success(allResults);
          })
          .catch(reject);
      } else {
        setTimeout(() => {
          this.search(options)
            .then(success)
            .catch(reject);
        }, 20);
      }
    });
  }
}

export default MultiProviderSearch;
