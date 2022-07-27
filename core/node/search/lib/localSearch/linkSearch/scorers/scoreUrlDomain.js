import { matchHost } from '../wellKnownDomains.js';

const DOMAIN_PRIORITIES = ['com', 'eth', 'org', 'net', 'app'];
const MAX_DOMAINS = 100;

export default function scoreForDomain(url) {
  const { hostname } = new URL(url);

  if (hostname) {
    if (matchHost(hostname)) {
      return -1;
    }

    const parts = hostname.split('.');
    if (parts.length > 1) {
      const domain = parts[parts.length - 1].toLowerCase();

      const index = DOMAIN_PRIORITIES.indexOf(domain);

      if (index != -1) {
        return MAX_DOMAINS - index;
      }
    }
  }

  return 0;
}
