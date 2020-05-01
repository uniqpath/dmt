function searchPredicate(line, terms) {
  const arrayTerms = Array.isArray(terms) ? terms : terms.toString().split(' ');

  for (const term of arrayTerms.map(term => term.trim().toLowerCase())) {
    if (!line.toLowerCase().includes(term)) {
      return false;
    }
  }

  return true;
}

export default searchPredicate;
