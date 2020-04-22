import dmt from 'dmt-bridge';

const { stopwatchAdv } = dmt;

import contentSearch from './contentSearch';

class LocalProviderSearch {
  constructor({ provider, mediaType }) {
    this.mediaType = mediaType;

    this.providerHost = provider.host;
    this.providerAddress = dmt.hostAddress(provider);

    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;
  }

  search({ terms, clientMaxResults, mediaType, contentRef }) {
    const options = { terms, clientMaxResults, mediaType: mediaType || this.mediaType };
    const contentId = contentRef || this.localContentId;

    return new Promise((success, reject) => {
      if (this.localhost) {
        this.timedLocalSearch(contentId, options)
          .then(success)
          .catch(e => {
            reject(e);
          });
      } else {
        throw new Error('Bug in code: this provider should be local!');
      }
    });
  }

  basicMetaInfo() {
    return { providerHost: this.providerHost, providerAddress: this.providerAddress, contentId: this.localContentId };
  }

  searchResponse({ response, contentId }) {
    if (!response.error) {
      Object.assign(response.meta, this.basicMetaInfo(), { totalCount: response.results.length, contentId });
    }

    return response;
  }

  localSearch(contentId, { terms, clientMaxResults, mediaType, onlySearchCatalogs }) {
    return new Promise((success, reject) => {
      contentSearch(contentId, { terms, clientMaxResults, mediaType: mediaType || this.mediaType, onlySearchCatalogs })
        .then(response => {
          success(this.searchResponse({ response, contentId }));
        })
        .catch(reject);
    });
  }

  timedLocalSearch(contentId, options) {
    const start = stopwatchAdv.start();

    return new Promise((success, reject) => {
      this.localSearch(contentId, options)
        .then(results => {
          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);

          Object.assign(results.meta, { searchTime, searchTimePretty });

          success(results);
        })
        .catch(reject);
    });
  }
}

export default LocalProviderSearch;
