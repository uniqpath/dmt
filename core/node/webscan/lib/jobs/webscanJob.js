import { util, colors } from 'dmt/common';

import scanWebLink from '../scanWebLink';
import ingestLinksFromDirectory from '../ingest/txtFiles/ingestLinksFromDirectory';

import { processBatch } from 'dmt/common';

const INVALID_TITLES = ['Attention Required!', 'Amazon.com', '403 Forbidden'];
function invalidTitle(title) {
  return (
    title &&
    (INVALID_TITLES.includes(title) ||
      title.toLowerCase().includes('proxy error') ||
      title.endsWith(' | Cloudflare') ||
      title.startsWith('Access denied') ||
      title.startsWith('Just a moment'))
  );
}

function maximumID(existingLinkIndex) {
  const ids = existingLinkIndex.map(({ id }) => id).filter(Boolean);
  return Math.max(Math.max(...ids), 0);
}

let maxId;

function wrapScanWebLink(existingLinkIndex) {
  return linkEntry => {
    const match = existingLinkIndex.find(({ url }) => url == linkEntry.url);

    if (match && !match.webscanFailed && !invalidTitle(match?.urlmetadata?.title)) {
      console.log(colors.gray(`Found match in existing link index for url ${colors.white(linkEntry.url)}:`));

      return new Promise((success, reject) => {
        success({ ...match, ...linkEntry, alreadyPresentInIndex: true });
      });
    }

    if (match) {
      linkEntry.id = match.id;
      linkEntry.createdAt = match.createdAt;
    }

    return scanWebLink(linkEntry);
  };
}

export default function spiderJob({ linksDirectory, onBatchFinished, existingLinkIndex }) {
  maxId = maximumID(existingLinkIndex);

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

            for (const result of successes.filter(({ id }) => !id)) {
              maxId += 1;
              result.id = maxId;
            }

            for (const result of successes.filter(({ createdAt }) => !createdAt)) {
              result.createdAt = Date.now();
            }

            // replace invalid titles (Cloudflare Access denied, Just a moment etc.) with url
            for (const result of successes) {
              if (invalidTitle(result?.urlmetadata?.title)) {
                result.urlmetadata.title = result.url.replace(/^https?:\/\//, '');
                result.webscanFailed = true;
              }
            }

            onBatchFinished({ successes, errors, isLastBatch });
          }
        });
      })
      .catch(reject);
  });
}
