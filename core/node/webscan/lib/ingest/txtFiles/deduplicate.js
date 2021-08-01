import { colors } from 'dmt/common';

export default function deduplicate(entries) {
  const deduped = [];

  for (const entry of entries) {
    const match = deduped.find(({ url }) => url == entry.url);

    if (match) {
      console.log(colors.red('⚠️  Skipping duplicate:'));
      console.log(colors.gray(entry));
      console.log('because this entry already exists:');
      console.log(colors.cyan(match));
      console.log();
    } else {
      deduped.push(entry);
    }
  }

  return deduped;
}
