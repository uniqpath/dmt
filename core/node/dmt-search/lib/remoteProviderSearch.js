import dmt from 'dmt-bridge';
const { stopwatch } = dmt;

import { serializeArgs } from 'dmt-search';

class RemoteProviderSearch {
  constructor({ provider, connector, mediaType }) {
    this.mediaType = mediaType;
    this.connector = connector;

    this.providerHost = provider.host;
    this.providerAddress = dmt.hostAddress(provider);

    this.localContentId = provider.contentRef;

    this.localhost = provider.localhost;
  }

  search({ terms, clientMaxResults, mediaType, contentRef }) {
    const contentId = contentRef || this.localContentId;

    return new Promise((success, reject) => {
      if (!this.localhost) {
        const args = serializeArgs({ terms, mediaType: mediaType || this.mediaType, count: clientMaxResults, contentRef: contentId });

        const start = stopwatch.start();

        this.connector
          .remoteObject('actors')
          .call('call', ['search', 'search', args])
          .then(response => {
            if (Array.isArray(response) && response.length == 1) {
              response = response[0];
            }

            const duration = stopwatch.stop(start);

            success(this.searchResponse({ response, contentId, duration }));
          })
          .catch(error => {
            let message;
            if (error.errorCode == 'CLOSED_CHANNEL') {
              message = 'provider currently unreachable';
              success({ error: message || error.message, meta: this.basicMetaInfo() });
            }
          });
      } else {
        throw new Error('Bug in code: this provider should be remove!');
      }
    });
  }

  basicMetaInfo() {
    return { providerHost: this.providerHost, providerAddress: this.providerAddress, contentId: this.localContentId };
  }

  searchResponse({ response, contentId, duration }) {
    if (!response.error) {
      Object.assign(response.meta, this.basicMetaInfo(), { totalCount: response.results.length, contentId, totalDuration: duration });
    }

    return response;
  }
}

export default RemoteProviderSearch;
