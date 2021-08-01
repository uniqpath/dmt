import { parseCliArgs, util } from 'dmt/common';

import maxResults from './maxResults.js';

function parseSearchQuery({ query, apiName, defaultMediaType }) {
  if (typeof query !== 'string') {
    throw new Error('parseSearchQuery:query must be string!');
  }

  const { serverMaxResults } = maxResults(apiName);

  const { terms, atDevices, attributeOptions } = parseCliArgs(query.trim().split(/\s+/));

  const { media } = attributeOptions;

  let { page, count } = attributeOptions;

  page = page ? parseInt(page) : 1;

  if (count) {
    count = parseInt(count);
  }

  return { terms, page, mediaType: media || defaultMediaType, count: count || serverMaxResults, atDevices };
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
