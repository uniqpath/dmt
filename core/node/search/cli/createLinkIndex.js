import colors from 'colors';

import util from 'util';
import fs from 'fs';
import path from 'path';

import scanWebLink from '../lib/localSearch/linkSearch/scanWebLink';
import linkIndexPath from '../lib/localSearch/linkSearch/linkIndexPath';
import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, scan, processBatch } = dmt;

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

function readLinks() {
  return new Promise((success, reject) => {
    const linksDirectory = linkIndexPath();

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
            .map(({ filePath, fileBuffer, error, hiddenContext }) => {
              const lines = splitToLines(fileBuffer);
              const urls = [];

              let context = '';

              lines.forEach((line, index) => {
                if (lines[index].trim() != '' && !lines[index].trim().startsWith('http')) {
                  context = lines[index].trim();

                  if (context.endsWith(':')) {
                    context = context.slice(0, -1);
                  }
                }

                if (lines[index].trim() == '') {
                  context = '';
                }

                if (line.trim().startsWith('http')) {
                  urls.push({ url: line.trim(), context, filePath, githubLineNum: index + 1 });
                }
              });

              return urls;
            })
            .flat();

          const num = 10;

          const justOneBatch = false;

          if (justOneBatch) {
            console.log(colors.red(`⚠️  Warning: Scanning just first ${num} links because justOneBatch == true`));
          }

          processBatch({
            entries: urls,
            asyncMap: scanWebLink,
            batchSize: num,
            justOneBatch,
            afterAsyncResultsBatch: results => {
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

const linksDirectory = linkIndexPath();

const indexFile = path.join(linksDirectory, 'index.json');
const indexFile2 = path.join(linksDirectory, 'index_emergency_backup.json');

readLinks().then(({ successfulResults, unsuccessfulResults }) => {
  const linkIndex = successfulResults;
  console.log();
  console.log(colors.green(`Indexed ${colors.yellow(linkIndex.length)} entries.`));
  fs.writeFileSync(indexFile, JSON.stringify(linkIndex, null, 2));
  fs.writeFileSync(indexFile2, JSON.stringify(linkIndex, null, 2));

  if (unsuccessfulResults.length > 0) {
    console.log(colors.red('Failed links (cannot fetch or cannot scrape metainfo):'));
    console.log(colors.red(JSON.stringify(unsuccessfulResults, null, 2)));
  }
});

console.log(`Written to ${indexFile}`);
