export default function(results) {
  return results.sort((a, b) => b.score - a.score);
}
