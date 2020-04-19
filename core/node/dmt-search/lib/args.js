import dmt from 'dmt-bridge';
const { cli } = dmt;

function parseArgs({ args, actorName, defaultMediaType }) {
  if (typeof args === 'string') {
    const { terms, atDevices, attributeOptions } = cli(args.trim().split(/\s+/));

    const mediaType = attributeOptions.media || defaultMediaType;
    const clientMaxResults = attributeOptions.count;
    const { contentRef } = attributeOptions;

    args = { terms, mediaType, clientMaxResults, contentRef };
  }

  const { serverMaxResults } = dmt.maxResults(actorName);
  const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;

  return { ...args, ...{ clientMaxResults } };
}

function serializeArgs({ terms, mediaType, count, contentRef }) {
  return `${terms.join(' ')} @media=${mediaType} @count=${count} @contentRef=${contentRef}`;
}

export { parseArgs, serializeArgs };
