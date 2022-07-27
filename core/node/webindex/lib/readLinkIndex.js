import fs from 'fs';
import path from 'path';

import { addSiteTag } from 'dmt/search';

import { push } from 'dmt/notify';

import { log, stopwatch, tags, util, colors, dmtHereEnsure } from 'dmt/common';

const REREAD_INDEX_INTERVAL_SECONDS = 10;
const RECENT_WEBLINKS_NUM = 30;

import { scan } from 'dmt/common';
import addDerivedData from './derived/index.js';

function addDerived(webindex) {
  for (const linkInfo of webindex) {
    addDerivedData(linkInfo);
  }

  return webindex;
}

let webindexCache;

function rereadIndexLoop({ initial = true, program } = {}) {
  entireLinkIndex({ forceRead: true, benchmark: initial, program });

  setTimeout(() => {
    rereadIndexLoop({ initial: false, program });
  }, REREAD_INDEX_INTERVAL_SECONDS * 1000);
}

function addLinkIndexName(index, linkIndexName) {
  return index.map(entry => {
    return { ...entry, linkIndexName };
  });
}

function deviceLinkIndexWithoutDerivedData(deviceName) {
  if (deviceName) {
    const indexFile = path.join(dmtHereEnsure('webindex'), `${deviceName}.json`);

    if (fs.existsSync(indexFile)) {
      return JSON.parse(fs.readFileSync(indexFile));
    }

    return [];
  }
}

function createEntireLinkIndexCloud(results) {
  return tags.addQuantiles(tags.sortTagcloud(tags.pruneTagcloud(tags.createTagcloud(results), 70)));
}

function entireLinkIndex({ forceRead = false, benchmark = false, program } = {}) {
  return new Promise((success, reject) => {
    if (!forceRead && webindexCache) {
      success(webindexCache);
      return;
    }

    const start = stopwatch.start();

    const files = scan.recursive(dmtHereEnsure('webindex'), {
      flatten: true,
      extname: '.json',
      filter: ({ basename, reldir }) => {
        return !basename.includes('-disabled');
      }
    });

    scan.readFiles(files).then(results => {
      const _webindex = results
        .map(({ filePath, fileBuffer, error }) => {
          if (error) {
            console.log(`Problem reading index file: ${filePath}`);
          } else {
            let index;

            try {
              index = JSON.parse(fileBuffer.toString());
            } catch (e) {
              const msg = `Error parsing linkIndex ${filePath}:`;
              log.red(msg);
              log.red(e);

              push.notify(`⚠️ Error parsing linkIndex: ${e}`);

              return { parsingError: true };
            }

            const linkIndexName = path.basename(filePath, '.json');
            const linkIndex = addDerived(addLinkIndexName(index, linkIndexName));

            return linkIndex;
          }
        })
        .filter(Boolean)
        .flat();

      if (!_webindex.find(({ parsingError }) => parsingError)) {
        webindexCache = _webindex;

        const recentWeblinks = webindexCache
          .filter(({ createdAt }) => createdAt)
          .sort(util.orderBy('createdAt', null, 'desc'))
          .slice(0, RECENT_WEBLINKS_NUM)
          .map(entry => addSiteTag(entry));

        program.slot('recentWeblinks').set(recentWeblinks);

        program.slot('entireLinkIndexCloud').set(createEntireLinkIndexCloud(webindexCache), { announce: false });
        program.slot('entireLinkIndexCount').set(webindexCache.length, { announce: false });

        if (benchmark && files.length) {
          log.green(
            `Finished reading ${colors.magenta('~/.dmt-here/webindex/')}${colors.magenta(
              files.map(({ basename }) => basename).join(', ')
            )} webindices in ${colors.yellow(stopwatch.stop(start))} · links count: ${colors.yellow(webindexCache.length)}`
          );
        }
      }

      success(webindexCache);
    });
  });
}

export { entireLinkIndex, deviceLinkIndexWithoutDerivedData, rereadIndexLoop };
