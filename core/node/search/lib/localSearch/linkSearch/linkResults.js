import scoreEntry from './scoreEntry';

function linkResults(queryStr, linkIndex) {
  const results = linkIndex
    .map(entry => scoreEntry(entry, queryStr))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

export default linkResults;
