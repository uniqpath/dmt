import dmt from 'dmt/common';
const { util } = dmt;

function normalize(str) {
  return util
    .normalizeStr(str)
    .trim()
    .toLowerCase();
}

function normalizeTerms(terms) {
  const strTerms = Array.isArray(terms) ? terms.join(' ') : terms;

  const arrayTerms = strTerms
    .trim()
    .replace(/[.,]/g, ' ')
    .split(/\s+/);

  return arrayTerms.map(term => normalize(term));
}

function searchPredicate(line, terms, { normalizedTerms = false } = {}) {
  const normalizedLine = normalize(line);

  const _terms = normalizedTerms ? terms : normalizeTerms(terms);

  let score = 0;

  for (const term of _terms) {
    if (normalizedLine.match(new RegExp(`\\b${term}\\b`))) {
      score += 5;
    } else if (normalizedLine.includes(term)) {
      score += 1;
    } else {
      return 0;
    }
  }

  return score;
}

export { searchPredicate, normalizeTerms };
