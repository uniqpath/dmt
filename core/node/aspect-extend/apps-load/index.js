import express from 'express';

import fs from 'fs';

import { log, colors } from 'dmt/common';

import loadApps from './loadApps.js';
import { appFrontendList, appsDir, allApps } from './appFrontendList.js';

async function init(program) {
  program.slot('appList').set(appFrontendList());

  if (!fs.existsSync(appsDir)) {
    log.gray("Apps directory doesn't exist");
  }

  loadApps(allApps)
    .then(appDefinitions => {
      program.emit('apps_loaded', appDefinitions);
    })
    .catch(e => {
      log.red('Problem loading apps');
      log.red(e);
    });
}

export { init, appFrontendList };
