import { searchPredicate } from 'dmt/search';

function scoreEntry(entry, queryStr) {
  let score = 0;

  const { url, title, context, hiddenContext } = entry;

  const { host } = new URL(url);

  if (searchPredicate(host, queryStr)) {
    score += 30;

    const perc = Math.round((100 * queryStr.length) / url.length);
    score += perc;
  }

  if (searchPredicate(url, queryStr)) {
    score += 10;
  }

  if (searchPredicate(title, queryStr)) {
    score += 5;
  }

  if (searchPredicate(context, queryStr)) {
    score += 2;
  }

  if (searchPredicate(hiddenContext, queryStr)) {
    score += 1;
  }

  if (score > 0) {
    if (host.endsWith('github.com')) {
      score += 30;
    }
  }

  return { ...entry, ...{ score } };
}

export default scoreEntry;
