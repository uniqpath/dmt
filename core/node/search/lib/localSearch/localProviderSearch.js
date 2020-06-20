import colors from 'colors';
import dmt from 'dmt/bridge';

const { log, stopwatchAdv } = dmt;

import contentSearch from './fsSearch/contentSearch';

import { basicMetaInfo } from '../resultsMetaInfo/basicMetaInfo';

import swarmSearch from './swarmSearch/swarmSearch';
import noteSearch from './noteSearch/noteSearch';

class LocalProviderSearch {
  constructor({ provider }) {
    this.providerHost = provider.host;
    this.providerAddress = provider.address;
    this.contentId = provider.contentId;
    this.localhost = provider.localhost;
  }

  makeSearchPromise(options) {
    switch (options.contentId) {
      case 'swarm':
        return this.timedLocalSearch({ func: swarmSearch, options });
      case 'notes':
        return this.timedLocalSearch({ func: noteSearch, options });
      default:
        return this.timedLocalSearch({ func: contentSearch, options });
    }
  }

  search({ terms, page, count, mediaType }) {
    const { contentId } = this;
    const options = { terms, count, page, mediaType, contentId };

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
          log.yellow(`Local search error: ${colors.red(e.message)}`);
          const { duration: searchTime, prettyTime: searchTimePretty } = stopwatchAdv.stop(start);
          Object.assign(response.meta, { contentId, searchTime, searchTimePretty });

          success(response);
        });
    });
  }
}

export default LocalProviderSearch;
