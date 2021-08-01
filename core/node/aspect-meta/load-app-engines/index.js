import express from 'express';

import fs from 'fs';

import { log, colors } from 'dmt/common';

import AppLoader from './loadApps';
import { appFrontendList, appsDir, allApps } from './appFrontendList';

function expressAppSetup(app) {
  appFrontendList().forEach(({ appName, publicDir }) => {
    log.cyan(`Loading app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(`/${appName}`)}`);
    app.use(`/${appName}`, express.static(publicDir));
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
    .then(appInitResults => {
      program.emit('apps_loaded', appInitResults);
    })
    .catch(e => {
      log.red('Problem loading apps');
      log.red(e);
    });

  return { expressAppSetup };
}

export { init, appFrontendList };
