import jayson from 'jayson';
import stopwatch from 'pretty-hrtime';

import dmt from 'dmt-bridge';

import contentSearch from './contentSearch';

class ProviderSearch {
  constructor({ provider, mediaType }) {
    this.mediaType = mediaType;

    this.providerHost = provider.host;
    this.providerAddress = dmt.hostAddress(provider);

    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;

    if (!this.localhost) {
      let port;
      if (provider.hostType == 'dns') {
        port = 80;
      } else {
        port = provider.port || dmt.services('rpc').port;
      }
      this.rpcClient = jayson.client.http(`http://${this.providerAddress}:${port}`);
    }
  }

  searchResponse({ results, contentId }) {
    if (results.error) {
      return results;
    }

    if (Array.isArray(results)) {
      if (results.length == 1) {
        return results[0];
      }
      return { meta: {}, results };
    }

    return { meta: Object.assign(results.meta, { totalCount: results.results.length, contentId }), results: results.results };
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
        .then(results => {
          success(this.searchResponse({ results, contentId }));
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
        dmt
          .promiseTimeout(dmt.globals.networkLimit.maxTimeOneHop, this.promisifyRpcRequest('search', Object.assign(options, { contentRef: contentId })))
          .then(response => {
            success(this.searchResponse({ results: response.result, contentId }));
          })
          .catch(error => {
            success({ error: error.message });
          });
      }
    });
  }
}

export default ProviderSearch;
