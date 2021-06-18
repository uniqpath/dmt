import { q25, q50, q95 } from './quantile';

function findTag(tagcloud, tag) {
  return tagcloud.find(entry => entry.tag == tag);
}

function sortTagcloud(tagcloud) {
  return tagcloud.sort((a, b) => {
    if (a.tag < b.tag) {
      return -1;
    }

    if (a.tag > b.tag) {
      return 1;
    }

    return 0;
  });
}

function sortTagcloudByCount(tagcloud) {
  return tagcloud.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }

    if (a.count < b.count) {
      return 1;
    }

    return 0;
  });
}

function pruneTagcloud(tagcloud, maxTags) {
  return sortTagcloudByCount(tagcloud).slice(0, maxTags);
}

function createTagcloud(entries) {
  const tagcloud = [];

  for (const entry of entries) {
    const { tags } = entry;

    for (const tag of tags) {
      const match = findTag(tagcloud, tag);
      if (match) {
        match.count += 1;
      } else {
        tagcloud.push({ tag, count: 1 });
      }
    }
  }

  return tagcloud;
}

function addQuantiles(tagcloud) {
  return tagcloud;

  const counts = tagcloud.map(({ count }) => count);

  const _q25 = q25(counts);
  const _q50 = q50(counts);
  const _q95 = q95(counts);

  return tagcloud.map(entry => {
    if (entry.count >= _q95) {
      entry.highQuantile = true;
    } else if (entry.count >= _q50) {
      entry.midQuantile = true;
    } else if (entry.count <= _q25) {
      entry.lowQuantile = true;
    }

    return entry;
  });
}

export default { createTagcloud, pruneTagcloud, sortTagcloud, sortTagcloudByCount, addQuantiles };
