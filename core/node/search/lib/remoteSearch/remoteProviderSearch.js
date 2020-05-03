import dmt from 'dmt/bridge';
import { serializeArgs } from 'dmt/search';

import { basicMetaInfo } from '../resultsMetaInfo/basicMetaInfo';

const { log, stopwatchAdv, prettyMicroTime } = dmt;

class RemoteProviderSearch {
  constructor({ provider, connector }) {
    this.connector = connector;

    this.providerHost = provider.host;
    this.providerAddress = provider.address;
    this.providerPort = provider.port;
    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;
  }

  searchResponse({ response, contentId, networkTime, networkTimePretty }) {
    if (!response.error) {
      Object.assign(response.meta, basicMetaInfo(this), { totalCount: response.results.length, contentId, networkTime, networkTimePretty });
    }

    return response;
  }

  search({ terms, clientMaxResults, mediaType, contentRef }) {
    const contentId = contentRef || this.localContentId;

    return new Promise((success, reject) => {
      if (!this.localhost) {
        const args = serializeArgs({ terms, mediaType, count: clientMaxResults, contentRef: contentId });

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
              message = 'provider currently unreachable';
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
