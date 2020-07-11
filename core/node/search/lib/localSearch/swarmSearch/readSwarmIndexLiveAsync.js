import util from 'util';
import fs from 'fs';
import path from 'path';

import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, scan } = dmt;

function reportIssue(msg) {
  log.red(`⚠️  Warning: ${msg}`);
  push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg}`);
}

function readSwarmIndex() {
  return new Promise((success, reject) => {
    console.log(
      'WARNING: please implement 5s cache so that json tree is not re-read on each search request... still a great tradeoff between liveness and performance'
    );

    const swarmIndexDirectory = path.join(dmt.deviceDir(), 'swarmlinks');

    if (fs.existsSync(swarmIndexDirectory)) {
      const files = scan.recursive(swarmIndexDirectory, { flatten: true, extname: '.json' });

      const fileRead = util.promisify(fs.readFile);

      Promise.all(
        files
          .filter(({ basename }) => !basename.includes('-disabled'))
          .map(({ path, relpath }) => {
            return new Promise(success => {
              const hiddenContext = relpath.replace(/\.json$/i, '');
              fileRead(path)
                .then(fileBuffer => success({ filePath: path, fileBuffer, hiddenContext }))
                .catch(e => success({ error: e.message }));
            });
          })
      )
        .then(results => {
          const swarmIndices = results.map(({ error, filePath, fileBuffer, hiddenContext }) => {
            if (error) {
              reportIssue(`swarm index file ${filePath} could not be read: ${error}`);
              return [];
            }

            try {
              const swarmIndex = JSON.parse(fileBuffer.toString()).filter(({ disabled }) => !disabled);

              const hasMissingNames = swarmIndex.find(({ name }) => !name);

              if (hasMissingNames) {
                reportIssue(`Some entries form swarm index file ${filePath} don't have name attribute, these entries were ignored!`);
              }

              for (const entry of swarmIndex.filter(({ name }) => name)) {
                Object.assign(entry, { hiddenContext });

                const { name } = entry;

                if (name.toLowerCase().endsWith('.eth')) {
                  entry.entryType = 'ens';
                }
              }

              return swarmIndex;
            } catch (e) {
              reportIssue(`swarm index file ${filePath} could not be parsed: ${e.message}`);
              return [];
            }
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
