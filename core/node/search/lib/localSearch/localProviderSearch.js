import dmt from 'dmt/bridge';

const { stopwatchAdv } = dmt;

import contentSearch from './contentSearch';

import { basicMetaInfo } from '../metaInfo';

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
          .catch(reject);
      } else {
        throw new Error('Bug in code: this provider should be local!');
      }
    });
  }

  searchResponse({ response, contentId }) {
    if (!response.error) {
      Object.assign(response.meta, basicMetaInfo(this), { totalCount: response.results.length, contentId });
    }

    return response;
  }

  localSearch(contentId, { terms, clientMaxResults, mediaType, onlySearchCatalogs }) {
    return new Promise((success, reject) => {
      contentSearch(contentId, { terms, clientMaxResults, mediaType: mediaType || this.mediaType, onlySearchCatalogs })
        .then(success)
        .catch(reject);
    });
  }

  timedLocalSearch(contentId, options) {
    const start = stopwatchAdv.start();

    return new Promise((success, reject) => {
      this.localSearch(contentId, options)
        .then(_response => {
          const response = this.searchResponse({ response: _response, contentId });

          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);
          Object.assign(response.meta, { searchTime, searchTimePretty });

          success(response);
        })
        .catch(e => {
          const response = { meta: basicMetaInfo(this), error: e.message };

          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);

          Object.assign(response.meta, { contentId, searchTime, searchTimePretty });

          success(response);
        });
    });
  }
}

export default LocalProviderSearch;
