import dmt from 'dmt/bridge';
const { cli, util } = dmt;

import maxResults from './maxResults';

function parseArgs({ args, actorName, defaultMediaType }) {
  if (typeof args === 'string') {
    const { terms, atDevices, attributeOptions } = cli(args.trim().split(/\s+/));

    const { page } = attributeOptions;

    const mediaType = attributeOptions.media || defaultMediaType;
    const clientMaxResults = attributeOptions.count;
    const { contentRef } = attributeOptions;

    args = { terms, mediaType, page, clientMaxResults, atDevices, contentRef };
  }

  const { serverMaxResults } = maxResults(actorName);
  const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;

  return { ...args, ...{ clientMaxResults } };
}

function serializeArgs({ terms, mediaType, page, count, contentRef }) {
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

  if (contentRef) {
    list.push(`@contentRef=${contentRef}`);
  }

  return list.join(' ');
}

export { parseArgs, serializeArgs };
