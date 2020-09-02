import colors from 'colors';

import util from 'util';
import fs from 'fs';
import path from 'path';

import scanWebLink from '../lib/scanWebLink';
import parseLinksTxtFile from '../lib/parseLinksTxtFile';
import { readLinkIndex, linkIndexPath } from 'dmt/webindex';
import writeFileAtomic from 'write-file-atomic';

import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, scan, processBatch } = dmt;

const args = process.argv.slice(2);

if (args.length != 1) {
  console.log(colors.yellow('Usage:'));
  console.log('cli createLinkIndex [deviceName]');
  process.exit();
}

const deviceName = args[0];

function reportIssue(msg) {
  log.red(`⚠️  Warning: ${msg}`);
  push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg}`);
}

function splitToLines(buffer) {
  return buffer
    .toString()
    .split('\r')
    .join('')
    .split('\n');
}

const linksDirectory = linkIndexPath(deviceName);

const indexFile = path.join(linksDirectory, 'index.json');
const indexFile2 = path.join(linksDirectory, 'index_emergency_backup.json');

function writeLinkIndex(linkIndex) {
  writeFileAtomic(indexFile, JSON.stringify(linkIndex, null, 2), err => {
    if (err) throw err;
  });
}

function readLinks() {
  const existingLinkIndex = readLinkIndex({ deviceName });

  return new Promise((success, reject) => {
    const linksDirectory = linkIndexPath(deviceName);

    if (fs.existsSync(linksDirectory)) {
      const files = scan.recursive(linksDirectory, {
        flatten: true,
        filter: ({ basename, reldir, extname }) => {
          return !basename.includes('-disabled') && basename != 'README.md' && !reldir.endsWith('.git') && extname != '.json';
        }
      });

      const fileRead = util.promisify(fs.readFile);

      Promise.all(
        files.map(({ path }) => {
          return new Promise(success => {
            const hiddenContext = '';
            fileRead(path)
              .then(fileBuffer => success({ filePath: path, fileBuffer, hiddenContext }))
              .catch(e => success({ error: e.message }));
          });
        })
      )
        .then(results => {
          const urls = results
            .map(({ filePath, fileBuffer }) => {
              const lines = splitToLines(fileBuffer);

              return parseLinksTxtFile({ filePath, lines, existingLinkIndex });
            })
            .flat();

          const num = 10;

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

          const linkIndexInProgress = [];

          processBatch({
            entries: urls,
            asyncMap: scanWebLink,
            batchSize: num,
            beforeNextBatchCallback,
            justOneBatch,
            afterAsyncResultsBatch: results => {
              linkIndexInProgress.push(...results);
              writeLinkIndex(linkIndexInProgress);
              console.log(colors.white(`Current batch of ${num} links finished ${colors.green('✓')}`));
              console.log();
            },
            finishedCallback: linkIndex => {
              success({ successfulResults: linkIndex.filter(({ error }) => !error), unsuccessfulResults: linkIndex.filter(({ error }) => error) });
            }
          });
        })
        .catch(reject);
    } else {
      success([]);
    }
  });
}

export default readLinks;

readLinks().then(({ successfulResults, unsuccessfulResults }) => {
  const linkIndex = successfulResults;
  console.log();
  console.log(colors.green(`Indexed ${colors.yellow(linkIndex.length)} entries.`));
  writeLinkIndex(linkIndex);
  fs.writeFileSync(indexFile2, JSON.stringify(linkIndex, null, 2));

  if (unsuccessfulResults.length > 0) {
    console.log(colors.red('Failed links (cannot fetch or cannot scrape metainfo):'));
    console.log(colors.red(JSON.stringify(unsuccessfulResults, null, 2)));
  }
});

console.log(`Written to ${indexFile}`);
