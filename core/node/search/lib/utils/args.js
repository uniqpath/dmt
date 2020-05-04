import dmt from 'dmt/bridge';
const { cli, util } = dmt;

import maxResults from './maxResults';

function parseArgs({ args, actorName, defaultMediaType }) {
  if (typeof args === 'string') {
    const { terms, atDevices, attributeOptions } = cli(args.trim().split(/\s+/));

    const { page } = attributeOptions;

    const mediaType = attributeOptions.media || defaultMediaType;
    const clientMaxResults = attributeOptions.count;

    args = { terms, mediaType, page, clientMaxResults, atDevices };
  }

  const { serverMaxResults } = maxResults(actorName);
  const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;

  return { ...args, ...{ clientMaxResults } };
}

function serializeArgs({ terms, mediaType, page, count, contentId }) {
  const list = util.clone(terms);

  if (mediaType) {
    list.push(`@media=${mediaType}`);
  }

  if (page) {
    list.push(`@page=${page}`);
  }

  if (count) {
    list.push(`@count=${count}`);
  }

  if (contentId) {
    list.push(`@this/${contentId}`);
  }

  return list.join(' ');
}

function serializeContentRefs(atDevices) {
  return atDevices
    .map(({ address, port, contentId, hostType, host }) => {
      let contentRef = hostType == 'dmt' ? `@${host}` : `@${address}`;

      if (port) {
        contentRef = `${contentRef}:${port}`;
      }

      if (contentId) {
        contentRef = `${contentRef}/${contentId}`;
      }

      return contentRef;
    })
    .join(' ');
}

export { parseArgs, serializeArgs, serializeContentRefs };
