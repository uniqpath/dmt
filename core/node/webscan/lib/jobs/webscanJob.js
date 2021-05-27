import colors from 'colors';
import dmt from 'dmt/bridge';
const { util } = dmt;

import scanWebLink from '../scanWebLink';
import ingestLinksFromDirectory from '../ingest/txtFiles/ingestLinksFromDirectory';

const { processBatch } = dmt;

const INVALID_TITLES = ['Attention Required! | Cloudflare', 'Attention Required!'];

function wrapScanWebLink(existingLinkIndex) {
  return linkEntry => {
    const match = existingLinkIndex.find(({ url }) => url == linkEntry.url);

    if (match && !INVALID_TITLES.includes(match?.urlmetadata?.title)) {
      console.log(colors.gray(`Found match in existing link index for url ${colors.white(linkEntry.url)}:`));

      return new Promise((success, reject) => {
        success({ ...match, ...linkEntry, alreadyPresentInIndex: true });
      });
    }

    return scanWebLink(linkEntry);
  };
}

export default function spiderJob({ linksDirectory, onBatchFinished, existingLinkIndex }) {
  const asyncMap = wrapScanWebLink(existingLinkIndex);

  return new Promise((success, reject) => {
    ingestLinksFromDirectory(linksDirectory)
      .then(urls => {
        const num = 5;

        const justOneBatch = false;

        if (justOneBatch) {
          console.log(colors.red(`⚠️  Warning: Scanning just first ${num} links because justOneBatch == true`));
        }

        function beforeNextBatchCallback(nextBatch) {
          console.log(colors.yellow('Now scanning batch:'));
          for (const { url } of nextBatch) {
            console.log(colors.gray(url));
          }
          console.log();
        }

        processBatch({
          entries: util.shuffle(urls),
          asyncMap,
          batchSize: num,
          beforeNextBatchCallback,
          justOneBatch,
          afterAsyncResultsBatch: (results, { isLastBatch }) => {
            console.log(colors.white(`Current batch of ${num} links finished ${colors.green('✓')}`));
            console.log();

            const successes = results.filter(({ error }) => !error);
            const errors = results.filter(({ error }) => error);

            onBatchFinished({ successes, errors, isLastBatch });
          }
        });
      })
      .catch(reject);
  });
}
