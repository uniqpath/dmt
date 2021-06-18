import dmt from 'dmt/common';
const { sets, tags } = dmt;

const { sortTagcloud, pruneTagcloud } = tags;

const MAX_TAGS = 50;

function deemphasizeImplied(tagcloud, results, resultsMatchingAllSelectedTags, selectedTags) {
  tagcloud.forEach(entry => {
    const tagAppearsInAllResults = results.filter(result => result.tags.includes(entry.tag)).length == results.length;
    if (tagAppearsInAllResults && !selectedTags.includes(entry.tag)) {
      entry.impliedTag = true;
    }
  });
  return tagcloud;
}

function deemphasizeUnreachableTags(tagcloud, resultsMatchingAllSelectedTags) {
  const adjacentTags = [
    ...new Set(
      resultsMatchingAllSelectedTags
        .map(({ tags }) => tags)
        .filter(Boolean)
        .flat()
    )
  ];

  tagcloud.forEach(entry => {
    if (!adjacentTags.includes(entry.tag)) {
      entry.unreachableTag = true;
    }
  });

  return tagcloud;
}

export default function superTagcloud({ tagcloud, results, selectedTags }) {
  const resultsMatchingAllSelectedTags = [];

  for (const result of results) {
    const { tags } = result;
    if (sets.isSuperset(new Set(tags), new Set(selectedTags))) {
      resultsMatchingAllSelectedTags.push(result);
    }
  }

  const _tagcloud = sortTagcloud(pruneTagcloud(sortTagcloud(deemphasizeImplied(tagcloud, results, resultsMatchingAllSelectedTags, selectedTags)), MAX_TAGS));
  return selectedTags?.length ? deemphasizeUnreachableTags(_tagcloud, results) : _tagcloud;
}
