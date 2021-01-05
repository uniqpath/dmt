function debalkanize(str) {
  return str
    .replace(/[čć]/gi, 'c')
    .replace(/š/gi, 's')
    .replace(/ž/gi, 'z')
    .replace(/đ/gi, 'd');
}

function searchPredicate(line, terms) {
  const strTerms = Array.isArray(terms) ? terms.join(' ') : terms;

  const arrayTerms = strTerms
    .trim()
    .replace(/[.,]/g, ' ')
    .split(/\s+/);

  for (const term of arrayTerms.map(term => term.trim().toLowerCase())) {
    if (!debalkanize(line.toLowerCase()).includes(debalkanize(term))) {
      return false;
    }
  }

  return true;
}

export default searchPredicate;
