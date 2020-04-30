import dmt from 'dmt/bridge';
const { cli, util } = dmt;

function parseArgs({ args, actorName, defaultMediaType }) {
  if (typeof args === 'string') {
    const { terms, atDevices, attributeOptions } = cli(args.trim().split(/\s+/));

    const mediaType = attributeOptions.media || defaultMediaType;
    const clientMaxResults = attributeOptions.count;
    const { contentRef } = attributeOptions;

    args = { terms, mediaType, clientMaxResults, atDevices, contentRef };
  }

  const { serverMaxResults } = dmt.maxResults(actorName);
  const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;

  return { ...args, ...{ clientMaxResults } };
}

function serializeArgs({ terms, mediaType, count, contentRef }) {
  const list = util.clone(terms);

  if (mediaType) {
    list.push(`@media=${mediaType}`);
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
