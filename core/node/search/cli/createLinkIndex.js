import colors from 'colors';
import util from 'util';
import fs from 'fs';
import path from 'path';

import scrapeYt from 'scrape-yt';
import urlModule from 'url';

import readTitle from 'read-title';
import readLinkIndex from '../lib/localSearch/linkSearch/readLinkIndex';
import latestLinkIndexVersion from '../lib/localSearch/linkSearch/linkIndexVersion';

import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, scan } = dmt;

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
  const existingLinkIndex = readLinkIndex();

  return new Promise((success, reject) => {
    const linksDirectory = path.join(dmt.userDir, 'ZetaLinks');

    if (fs.existsSync(linksDirectory)) {
      const files = scan.recursive(linksDirectory, {
        flatten: true,
        filter: ({ basename, reldir }) => {
          return !basename.includes('-disabled') && basename != 'README.md' && !reldir.endsWith('.git');
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
          const urls = results.map(({ error, filePath, fileBuffer, hiddenContext }) => {
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
                urls.push({ url: line.trim(), context, filePath });
              }
            });

            return urls;
          });

          Promise.all(
            urls.flat().map(({ url, context, filePath }) => {
              console.log(colors.magenta(`Scanning url: ${url}`));

              return new Promise((success, reject) => {
                const match = existingLinkIndex.find(
                  linkInfo => linkInfo.url.toLowerCase() == url.toLowerCase() && linkInfo.linkIndexVersion == latestLinkIndexVersion
                );

                if (match) {
                  console.log('FOUND MATCH:');
                  console.log(match);

                  success(match);
                } else {
                  console.log(colors.gray(`Did not find a match in existing index for url: ${url}`));

                  if (url.endsWith('.pdf')) {
                    success({ url, title: '', context, latestLinkIndexVersion });
                  } else if (url.indexOf('/localhost') > -1) {
                    success({ url, title: 'WARNING: LOCAL LINK', context, latestLinkIndexVersion });
                  } else if (url.indexOf('youtube.com') > -1 && url.indexOf('v=') > -1) {
                    const videoId = urlModule.parse(url, { parseQueryString: true }).query['v'];
                    scrapeYt
                      .getVideo(videoId)
                      .then(({ title }) => {
                        success({ url, title, context, latestLinkIndexVersion });
                      })
                      .catch(error => {
                        console.log(`Link (video) ${url} probably unavailable ...`);
                        success({ url, context, error: 'VIDEO UNAVAILABLE', latestLinkIndexVersion });
                      });
                  } else {
                    readTitle(url)
                      .then(title => {
                        success({ url, title, context, latestLinkIndexVersion });
                      })
                      .catch(e => {
                        console.log(e);
                        reject(e);
                      });
                  }
                }
              });
            })
          )
            .then(results => success(results.filter(({ error }) => !error)))
            .catch(reject);
        })
        .catch(reject);
    } else {
      success([]);
    }
  });
}

export default readLinks;

const indexFile = path.join(dmt.userDir, 'ZetaLinks/index.json');

readLinks().then(linkIndex => {
  console.log(linkIndex);
  fs.writeFileSync(indexFile, JSON.stringify(linkIndex, null, 2));
});

console.log(`Written to ${indexFile}`);
