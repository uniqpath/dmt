import dmt from 'dmt/bridge';

const { stopwatchAdv } = dmt;

import contentSearch from './fsSearch/contentSearch';

import { basicMetaInfo } from '../resultsMetaInfo/basicMetaInfo';

import swarmSearch from './swarmSearch/swarmSearch';

class LocalProviderSearch {
  constructor({ provider }) {
    this.providerHost = provider.host;
    this.providerAddress = provider.address;

    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;
  }

  search({ terms, clientMaxResults, mediaType, contentRef }) {
    const options = { terms, clientMaxResults, mediaType };
    const contentId = contentRef || this.localContentId;

    if (contentId == 'swarm') {
      return new Promise((success, reject) => {
        if (this.localhost) {
          this.timedLocalSwarmSearch(contentId, options)
            .then(success)
            .catch(reject);
        } else {
          throw new Error('Bug in code: this provider should be local!');
        }
      });
    }

    return new Promise((success, reject) => {
      if (this.localhost) {
        this.timedLocalFSSearch(contentId, options)
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
      contentSearch(contentId, { terms, clientMaxResults, mediaType, onlySearchCatalogs })
        .then(success)
        .catch(reject);
    });
  }

  timedLocalSwarmSearch(contentId, options) {
    const start = stopwatchAdv.start();

    return new Promise((success, reject) => {
      swarmSearch(options)
        .then(({ results, maxResults }) => {
          const _response = { meta: { pageNumber: options.pageNumber, hasMore: false }, results };

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

  timedLocalFSSearch(contentId, options) {
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
