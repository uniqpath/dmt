import dmt from 'dmt-bridge';
const { log } = dmt;

import ProviderSearch from './providerSearch';

class SearchClient {
  constructor(providers, { mediaType } = {}) {
    this.providers = providers;

    this.searchArray = dmt.util.listify(providers).map(provider => new ProviderSearch({ provider, mediaType }));
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

          const aggregateResults = this.searchArray.map((providerSearch, index) => {
            const addedMetadata = {
              providerHost: providerSearch.providerHost,
              providerAddress: providerSearch.providerAddress
            };

            if (allResults[index].error) {
              return {
                meta: addedMetadata,
                error: allResults[index].error
              };
            }

            return {
              meta: Object.assign(allResults[index].meta, addedMetadata),
              results: allResults[index].results
            };
          });

          success(aggregateResults);
        })
        .catch(reject);
    });
  }
}

export default SearchClient;
