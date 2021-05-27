export default function scoreBySelectedTags({ entry, selectedTags }) {
  let score = 0;

  if (selectedTags?.length && entry.tags) {
    for (const tag of entry.tags) {
      if (selectedTags.includes(tag)) {
        score += 5000;
      }
    }
  }

  return score;
}
