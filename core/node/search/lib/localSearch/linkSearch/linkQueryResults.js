import scoreEntry from './scoreEntry.js';

export default function linkQueryResults({ terms, selectedTags, linkIndex }) {
  return linkIndex.map(entry => scoreEntry({ entry, terms, selectedTags }));
}
