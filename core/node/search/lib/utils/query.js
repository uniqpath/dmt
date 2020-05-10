import dmt from 'dmt/bridge';
const { parseCliArgs, util } = dmt;

import maxResults from './maxResults';

function parseSearchQuery({ query, actorName, defaultMediaType }) {
  if (typeof query !== 'string') {
    throw new Error('parseSearchQuery:query must be string!');
  }

  const { serverMaxResults } = maxResults(actorName);

  const { terms, atDevices, attributeOptions } = parseCliArgs(query.trim().split(/\s+/));
  const { page, mediaType, count } = attributeOptions;

  return { terms, page, mediaType: mediaType || defaultMediaType, count: count || serverMaxResults, atDevices };
}

function reconstructSearchQuery({ terms, mediaType, page, count, contentId }) {
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

export { parseSearchQuery, reconstructSearchQuery, serializeContentRefs };
