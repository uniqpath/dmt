function searchPredicate(line, terms) {
  const strTerms = Array.isArray(terms) ? terms.join(' ') : terms;

  const arrayTerms = strTerms
    .trim()
    .replace(/[.,]/g, ' ')
    .split(/\s+/);

  for (const term of arrayTerms.map(term => term.trim().toLowerCase())) {
    if (!line.toLowerCase().includes(term)) {
      return false;
    }
  }

  return true;
}

export default searchPredicate;
