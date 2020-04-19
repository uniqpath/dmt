import stopwatch from 'pretty-hrtime';

import dmt from 'dmt-bridge';

import { serializeArgs } from 'dmt-search';

import contentSearch from './contentSearch';

class ProviderSearch {
  constructor({ provider, connector, mediaType }) {
    this.mediaType = mediaType;
    this.connector = connector;

    this.providerHost = provider.host;
    this.providerAddress = dmt.hostAddress(provider);

    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;
  }

  searchResponse({ response, contentId }) {
    if (!response.error) {
      Object.assign(response.meta, { totalCount: response.results.length, providerHost: this.providerHost, providerAddress: this.providerAddress, contentId });
    }

    return response;
  }

  promisifyRpcRequest(command, options) {
    return new Promise((success, reject) => {
      options.mediaType = options.mediaType || this.mediaType;

      this.rpcClient.request(`search/${command}`, options, (err, response) => {
        const error = err || response.error;
        if (error) {
          reject(error);
        } else {
          success(response);
        }
      });
    });
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
    const start = process.hrtime();

    return new Promise((success, reject) => {
      this.localSearch(contentId, options)
        .then(results => {
          const end = process.hrtime(start);
          results.meta.searchTime = stopwatch(end);
          success(results);
        })
        .catch(reject);
    });
  }

  search({ terms, clientMaxResults, mediaType, contentRef }) {
    const options = { terms, clientMaxResults, mediaType };
    const contentId = contentRef || this.localContentId;

    return new Promise((success, reject) => {
      if (this.localhost) {
        this.timedLocalSearch(contentId, options)
          .then(success)
          .catch(reject);
      } else {
        const args = serializeArgs({ terms, mediaType, count: clientMaxResults, contentRef: contentId });

        this.connector
          .remoteObject('actors')
          .call('call', ['search', 'search', args])
          .then(response => {
            if (Array.isArray(response) && response.length == 1) {
              response = response[0];
            }

            success(this.searchResponse({ response, contentId }));
          })
          .catch(error => {
            success({ error: error.message });
          });
      }
    });
  }
}

export default ProviderSearch;
