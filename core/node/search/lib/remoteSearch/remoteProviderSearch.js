import dmt from 'dmt/bridge';
import { reconstructSearchQuery } from 'dmt/search';

import { basicMetaInfo } from '../resultsMetaInfo/basicMetaInfo';

const { log, stopwatchAdv, prettyMicroTime } = dmt;

class RemoteProviderSearch {
  constructor({ provider, connector }) {
    this.connector = connector;

    this.providerHost = provider.host;
    this.providerAddress = provider.address;
    this.providerPort = provider.port;
    this.contentId = provider.contentId;
    this.localhost = provider.localhost;
  }

  searchResponse({ response, contentId, networkTime, networkTimePretty }) {
    if (!response.error) {
      Object.assign(response.meta, basicMetaInfo(this), { resultCount: response.results.length, contentId, networkTime, networkTimePretty });
    }

    return response;
  }

  search({ terms, count, page, mediaType }) {
    const { contentId } = this;

    return new Promise((success, reject) => {
      if (!this.localhost) {
        const args = reconstructSearchQuery({ terms, mediaType, page, count, contentId });

        const start = stopwatchAdv.start();

        this.connector
          .remoteObject('search')
          .call('search', { query: args })
          .then(response => {
            if (Array.isArray(response) && response.length == 1) {
              response = response[0];
            }

            const { duration: totalDuration } = stopwatchAdv.stop(start);

            const { searchTime } = response.meta;

            const networkTime = totalDuration - searchTime;
            const networkTimePretty = prettyMicroTime(networkTime);

            success(this.searchResponse({ response, contentId, networkTime, networkTimePretty }));
          })
          .catch(error => {
            let { message } = error;

            if (error.errorCode == 'CLOSED_CHANNEL') {
              message = 'incorrect host or host currently unreachable';
            }

            success({ meta: basicMetaInfo(this), error: message });
          });
      } else {
        throw new Error('Bug in code: this provider should be remote!');
      }
    });
  }
}

export default RemoteProviderSearch;
