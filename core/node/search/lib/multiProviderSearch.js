import dmt from 'dmt/bridge';

import LocalProviderSearch from './localSearch/localProviderSearch';
import RemoteProviderSearch from './remoteSearch/remoteProviderSearch';

import enhanceResult from './enhanceResult';

const { log, util } = dmt;

class MultiProviderSearch {
  constructor({ program, providers, mediaType, searchOriginHost } = {}) {
    this.program = program;
    this.searchOriginHost = searchOriginHost;

    const providerList = util.listify(providers).map(provider => Object.assign(provider, { providerAddress: dmt.hostAddress(provider) }));

    const localProviders = providerList.filter(provider => provider.localhost);
    this.localProvidersCount = localProviders.length;

    const remoteProviders = providerList.filter(provider => !provider.localhost);
    this.remoteProvidersCount = remoteProviders.length;

    this.searchArray = localProviders.map(provider => {
      return new LocalProviderSearch({ provider, mediaType });
    });

    remoteProviders.forEach(provider => {
      program.fiberPool.getConnector(provider.providerAddress, provider.port || 7780).then(connector => {
        this.searchArray.push(new RemoteProviderSearch({ provider, mediaType, connector }));
      });
    });
  }

  prepareRequests(searchArray, options) {
    return searchArray.map(providerSearch => {
      return new Promise((success, reject) => {
        providerSearch
          .search(options)
          .then(providerResponse => success({ providerResponse, providerAddress: providerSearch.providerAddress }))
          .catch(e => {
            console.log('This should not happen');
            log.red(e);
            reject(e);
          });
      });
    });
  }

  processResponses(allResponses) {
    for (const { providerResponse, providerAddress, providerPort } of allResponses) {
      if (providerResponse.results) {
        providerResponse.results.forEach(result => {
          enhanceResult({ result, providerAddress, providerPort, searchOriginHost: this.searchOriginHost });
        });
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

export default MultiProviderSearch;
