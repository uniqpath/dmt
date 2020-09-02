import scoreEntry from './scoreEntry';
import addLinkTags from './addLinkTags';

function linkResults(terms, linkIndex) {
  const results = linkIndex
    .map(entry => scoreEntry(entry, terms))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return results.map(result => addLinkTags(result));
}

export default linkResults;
