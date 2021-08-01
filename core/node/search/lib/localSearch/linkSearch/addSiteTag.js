import { matchHost } from './wellKnownDomains';

function addSiteTag(entry) {
  const { host } = new URL(entry.url);

  return { ...entry, siteTag: matchHost(host) };
}

export default addSiteTag;
