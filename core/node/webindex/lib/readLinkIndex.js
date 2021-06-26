import fs from 'fs';
import path from 'path';
import colors from 'colors';

import { push } from 'dmt/notify';

import dmt from 'dmt/common';
const { log, stopwatch, tags, util } = dmt;

const REREAD_INDEX_INTERVAL_SECONDS = 10;
let indexReadAt;

const RECENT_WEBLINKS_NUM = 30;

const { scan } = dmt;
import addDerivedData from './derived';

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
    const indexFile = path.join(dmt.dmtHereEnsure('webindex'), `${deviceName}.json`);

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

    const files = scan.recursive(dmt.dmtHereEnsure('webindex'), {
      flatten: true,
      extname: '.json',
      filter: ({ basename, reldir }) => {
        return !basename.includes('-disabled');
      }
    });

    scan.readFiles(files).then(results => {
      webindexCache = results
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

              push.notify(`⚠️ ${dmt.deviceGeneralIdentifier()}: Error parsing linkIndex: ${e}`);

              return;
            }

            const linkIndexName = path.basename(filePath, '.json');
            const linkIndex = addDerived(addLinkIndexName(index, linkIndexName));

            if (program.device.id == linkIndexName) {
              const recentWeblinks = linkIndex
                .filter(({ id }) => id)
                .sort(util.orderBy('id', null, 'desc'))
                .slice(0, RECENT_WEBLINKS_NUM);
              program.store.replaceSlot('recentWeblinks', recentWeblinks);
            }

            return linkIndex;
          }
        })
        .filter(Boolean)
        .flat();

      program.store.replaceSlot('entireLinkIndexCloud', createEntireLinkIndexCloud(webindexCache), { announce: false });
      program.store.replaceSlot('entireLinkIndexCount', webindexCache.length, { announce: false });

      if (benchmark && files.length) {
        log.green(
          `Finished reading ${colors.magenta('~/.dmt-here/webindex/')}${colors.magenta(
            files.map(({ basename }) => basename).join(', ')
          )} webindices in ${colors.yellow(stopwatch.stop(start))} · links count: ${colors.yellow(webindexCache.length)}`
        );
      }

      indexReadAt = Date.now();

      success(webindexCache);
    });
  });
}

export { entireLinkIndex, deviceLinkIndexWithoutDerivedData, rereadIndexLoop };
