import url from 'url';

import { searchPredicate } from 'dmt/search';

function deconstructUrl(url) {
  return new URL(url);
}

function constructUrl(parts) {
  return url.format(parts);
}

function removeWWWSubdomain(_url) {
  const u = new URL(_url);
  u.hostname = u.hostname.replace(new RegExp(/^www\./, ''), '');
  return url.format(u);
}

export default function scoreUrl(url, { terms } = {}) {
  let score = 0;

  const normalizedUrl = removeWWWSubdomain(url);

  const { hostname } = new URL(normalizedUrl);

  terms.forEach(term => {
    const _pred = searchPredicate(normalizedUrl, term);
    if (_pred) {
      const perc = term.length / normalizedUrl.length;
      score += Math.round(100 * perc) * 30;

      if (hostname.match(new RegExp(`^\\${term}\\.`, 'i'))) {
        score += _pred * Math.round((1 + perc) * 500);
      } else if (searchPredicate(hostname, term)) {
        score += _pred * Math.round((1 + perc) * 200);
      }
    }
  });

  return score;
}
