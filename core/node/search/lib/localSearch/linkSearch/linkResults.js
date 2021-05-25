import scoreEntry from './scoreEntry';
import addLinkTags from './addLinkTags';
import sortLinks from '../../sortResults/sortLinks';

function linkResults(terms, linkIndex) {
  const results = sortLinks(linkIndex.map(entry => scoreEntry(entry, terms)).filter(({ score }) => score > 0));

  return results.map(result => addLinkTags(result));
}

export default linkResults;
