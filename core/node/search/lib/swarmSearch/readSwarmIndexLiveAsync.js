import util from 'util';
import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';
const { scan } = dmt;

function readSwarmIndex() {
  return new Promise((success, reject) => {
    console.log(
      'WARNING: please implement 5s cache so that json tree is not re-read on each search request... still a great tradeoff between liveness and performance'
    );

    const swarmIndexDirectory = path.join(dmt.userDir, 'SwarmIndex');

    if (fs.existsSync(swarmIndexDirectory)) {
      const files = scan.recursive(swarmIndexDirectory, { flatten: true, extname: '.json' });

      const fileRead = util.promisify(fs.readFile);

      Promise.all(
        files.map(({ path, relpath }) => {
          return new Promise((success, reject) => {
            const hiddenContext = relpath.replace(/\.json$/i, '');
            fileRead(path)
              .then(fileBuffer => success({ fileBuffer, hiddenContext }))
              .catch(reject);
          });
        })
      )
        .then(results => {
          const swarmIndices = results.map(({ fileBuffer, hiddenContext }) => {
            const swarmIndex = JSON.parse(fileBuffer.toString());

            for (const entry of swarmIndex) {
              Object.assign(entry, { hiddenContext });

              const { name } = entry;

              if (name.toLowerCase().endsWith('.eth')) {
                entry.entryType = 'ens';
              }
            }

            return swarmIndex;
          });

          success(swarmIndices.flat());
        })
        .catch(reject);
    } else {
      success([]);
    }
  });
}

export default readSwarmIndex;
