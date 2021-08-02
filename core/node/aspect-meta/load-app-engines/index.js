import colors from 'colors';
import express from 'express';
import dmt from 'dmt/common';
import fs from 'fs';

const { log } = dmt;

import AppLoader from './loadApps';
import { appFrontendList, appsDir, allApps } from './appFrontendList';

function expressAppSetup(app) {
  appFrontendList().forEach(({ appName, publicDir, appUrl }) => {
    log.cyan(`Loading app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(appUrl)}`);
    app.use(appUrl, express.static(publicDir));
  });
}

async function init(program) {
  program.store('appList').set(appFrontendList());

  const appLoader = new AppLoader(program);

  if (!fs.existsSync(appsDir)) {
    log.gray("Apps directory doesn't exist");
  }

  appLoader
    .load(allApps)
    .then(() => {
      program.emit('apps_loaded');
    })
    .catch(e => {
      log.red('Problem loading apps');
      log.red(e);
    });

  return { expressAppSetup };
}

export { init, appFrontendList };
