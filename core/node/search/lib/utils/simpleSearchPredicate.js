import dmt from 'dmt/bridge';
const { util } = dmt;

function normalize(str) {
  return util
    .normalizeStr(str)
    .trim()
    .toLowerCase();
}

function searchPredicate(line, terms) {
  const normalizedLine = normalize(line);

  const strTerms = Array.isArray(terms) ? terms.join(' ') : terms;

  const arrayTerms = strTerms
    .trim()
    .replace(/[.,]/g, ' ')
    .split(/\s+/);

  for (const term of arrayTerms) {
    if (!normalizedLine.includes(normalize(term))) {
      return false;
    }
  }

  return true;
}

export default searchPredicate;
