import fs from 'fs';
import path from 'path';

import { log, program } from 'dmt/common';

import { loadApps, importComplex } from './loadApps.js';
import { appFrontendList, appsDir, allApps } from './appFrontendList.js';

let _initialAppDefinitions;

function reloadSSRHandler({ server, appDir }) {
  return new Promise((success, reject) => {
    const match = _initialAppDefinitions.find(a => a.appDir == appDir && a.hasSSRHandler);

    if (match) {
      const appEntryFilePath = path.join(appDir, 'index.js');

      importComplex(appEntryFilePath)
        .then(({ handler }) => {
          server.useDynamicSSR(match.appName, handler, true);
          success();
        })
        .catch(e => {
          program.exceptionNotify(e, `Error while reloading ${appDir} ssr handler, check log`);
          reject(e);
        });
    }
  });
}

function reloadAllSSRHandlers({ server }) {
  return new Promise((success, reject) => {
    for (const { appDir, hasSSRHandler } of _initialAppDefinitions) {
      if (hasSSRHandler) {
        reloadSSRHandler({ server, appDir }).catch(reject);
      }
    }
  });
}

async function init(program) {
  program.slot('appList').set(appFrontendList());

  if (!fs.existsSync(appsDir)) {
    log.gray("Apps directory doesn't exist");
  }

  loadApps(allApps)
    .then(appDefinitions => {
      _initialAppDefinitions = JSON.parse(JSON.stringify(appDefinitions));

      program.emit('apps_loaded', appDefinitions);
    })
    .catch(e => {
      log.red('Problem loading apps');
      log.red(e);
    });
}

export { init, appFrontendList, reloadSSRHandler, reloadAllSSRHandlers };
