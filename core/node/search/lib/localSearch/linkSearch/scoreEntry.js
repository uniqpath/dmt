import { searchPredicate } from 'dmt/search';

function scoreForEachHit(text, { terms, scorePerHit, special = false } = {}) {
  let score = 0;

  terms.forEach(term => {
    if (searchPredicate(text || '', term)) {
      score += scorePerHit;
    }

    if (special) {
      const perc = Math.round((100 * term.length) / text.length);
      score += perc;
    }
  });

  return score;
}

function scoreEntry(entry, terms) {
  let score = 0;

  const { title, context, hiddenContext, url, linkNote } = entry;

  const allTogether = `${title} ${context} ${hiddenContext} ${url} ${linkNote}`;

  if (searchPredicate(allTogether, terms)) {
    score = 1;

    const { host } = new URL(url);

    score += scoreForEachHit(host, { terms, scorePerHit: 30, special: true });
    score += scoreForEachHit(url, { terms, scorePerHit: 10 });
    score += scoreForEachHit(title, { terms, scorePerHit: 5 });
    score += scoreForEachHit(context, { terms, scorePerHit: 2 });
    score += scoreForEachHit(hiddenContext, { terms, scorePerHit: 1 });
    if (score > 0) {
      if (host.endsWith('github.com')) {
        score += 50;
      }
    }
  }

  return { ...entry, ...{ score } };
}

export default scoreEntry;
