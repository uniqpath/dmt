function normalize() {}

function normalizeSearchTerms(_terms) {
  const terms = [];

  if (_terms.length > 0) {
    for (const term of _terms
      .join(' ')
      .replace(/[.,]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')) {
      terms.push(term);
    }
  }

  return terms;
}

export default normalizeSearchTerms;
