import dmt from 'dmt/bridge';

import LocalProviderSearch from './localSearch/localProviderSearch';
import RemoteProviderSearch from './remoteSearch/remoteProviderSearch';

import enhanceResult from './enhanceResult';

const { log, util } = dmt;

class ParaSearch {
  constructor({ connectorPool, contentProviders, searchOriginHost } = {}) {
    this.searchOriginHost = searchOriginHost;

    const localProviders = contentProviders.filter(provider => provider.localhost);
    this.localProvidersCount = localProviders.length;

    const remoteProviders = contentProviders.filter(provider => !provider.localhost);
    this.remoteProvidersCount = remoteProviders.length;

    this.searchArray = localProviders.map(provider => new LocalProviderSearch({ provider }));

    remoteProviders.forEach(provider => {
      const { address, port } = provider;

      connectorPool.getConnector({ address, port: port || 7780 }).then(connector => {
        this.searchArray.push(new RemoteProviderSearch({ provider, connector }));
      });
    });
  }

  prepareRequests(searchArray, options) {
    return searchArray.map(providerSearch => {
      return new Promise((success, reject) => {
        providerSearch
          .search(options)
          .then(providerResponse => success({ providerResponse, providerAddress: providerSearch.providerAddress, providerKey: providerSearch.providerKey }))
          .catch(e => {
            console.log('This should not happen');
            log.red(e);
            reject(e);
          });
      });
    });
  }

  processResponses(allResponses) {
    for (const { providerResponse, providerAddress, providerPort, providerKey } of allResponses) {
      if (providerResponse.results) {
        providerResponse.results.forEach(result => {
          enhanceResult({ result, providerAddress, providerPort, providerKey, searchOriginHost: this.searchOriginHost });
        });

        providerResponse.results = providerResponse.results.sort(util.compareKeys('directory', 'fileName'));
      }
    }

    return allResponses.map(resp => resp.providerResponse);
  }

  async search(options) {
    return new Promise((success, reject) => {
      const allProvidersReady = this.remoteProvidersCount + this.localProvidersCount == this.searchArray.length;

      if (allProvidersReady) {
        const searches = this.prepareRequests(this.searchArray, options);

        Promise.all(searches)
          .then(allResponses => success(this.processResponses(allResponses)))
          .catch(e => {
            log.red('TOTAL REJECT -- should not happen:');
            log.red(e);
            reject(e);
          });
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

export default ParaSearch;
