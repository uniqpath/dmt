import { searchPredicate } from 'dmt/search';

function scoreForEachHit(text, { terms, scorePerHit } = {}) {
  let score = 0;

  terms.forEach(term => {
    if (searchPredicate(text, term)) {
      score += scorePerHit;
    }
  });

  return score;
}

function scoreUrlForEachHit(url, { terms } = {}) {
  let score = 0;

  const { host } = new URL(url);

  terms.forEach(term => {
    if (searchPredicate(url, term)) {
      const perc = term.length / url.length;
      score += Math.round(100 * perc) * 30;

      if (host.match(new RegExp(`^${term}\\.`))) {
        score += Math.round((1 + perc) * 500);
      } else if (host.indexOf(term) > -1) {
        score += Math.round((1 + perc) * 200);
      }
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

    score += scoreUrlForEachHit(url, { terms });
    score += scoreForEachHit(title, { terms, scorePerHit: 5 });
    score += scoreForEachHit(context, { terms, scorePerHit: 2 });
    score += scoreForEachHit(hiddenContext, { terms, scorePerHit: 1 });
  }

  return { ...entry, ...{ score } };
}

export default scoreEntry;