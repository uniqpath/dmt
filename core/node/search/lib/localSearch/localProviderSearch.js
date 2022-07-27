import { log, stopwatchAdv, colors } from 'dmt/common';

import contentSearch from './fsSearch/contentSearch.js';

import { basicMetaInfo } from '../resultsMetaInfo/basicMetaInfo.js';

import linkSearch from './linkSearch/linkSearch.js';
class LocalProviderSearch {
  constructor({ provider }) {
    this.providerHost = provider.host;
    this.providerAddress = provider.address;

    this.contentId = provider.contentId;
    this.localhost = provider.localhost;
    this.providerKey = provider.deviceKey;
  }

  makeSearchPromise(options) {
    switch (options.contentId) {
      case 'links':
        return this.timedLocalSearch({ func: linkSearch, options });
      default:
        return this.timedLocalSearch({ func: contentSearch, options });
    }
  }

  search({ terms, selectedTags, place, page, count, mediaType }) {
    const { contentId } = this;
    const options = { terms, selectedTags, place, count, page, mediaType, contentId };

    return new Promise((success, reject) => {
      if (this.localhost) {
        this.makeSearchPromise(options)
          .then(success)
          .catch(reject);
      } else {
        throw new Error('Bug in code: this provider should be local!');
      }
    });
  }

  enhanceResultsMeta({ response, contentId }) {
    if (!response.error) {
      Object.assign(response.meta, basicMetaInfo(this), { contentId });
    }

    return response;
  }

  timedLocalSearch({ func, options }) {
    const start = stopwatchAdv.start();

    const { contentId } = options;

    return new Promise(success => {
      func(options)
        .then(_response => {
          const response = this.enhanceResultsMeta({ response: _response, contentId });

          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);
          Object.assign(response.meta, { searchTime, searchTimePretty });

          success(response);
        })
        .catch(e => {
          const response = { meta: basicMetaInfo(this), error: e.message };
          log.yellow(`Local search error: ${colors.red(e)}`);
          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);
          Object.assign(response.meta, { contentId, searchTime, searchTimePretty });

          success(response);
        });
    });
  }
}

export default LocalProviderSearch;
