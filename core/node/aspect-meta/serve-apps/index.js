import colors from 'colors';
import express from 'express';
import path from 'path';
import dmt from 'dmt/common';
import fs from 'fs';

import AppLoader from './loadApps';

const { scan, log } = dmt;

const appsDir = path.join(dmt.dmtPath, 'apps');

function appList() {
  return fs.existsSync(appsDir) ? scan.dir(appsDir, { onlyDirs: true }) : [];
}

function appFrontendList() {
  return appList()
    .filter(appDir => fs.existsSync(path.join(appDir, 'public')))
    .map(appDir => {
      const appName = path.basename(appDir);

      return {
        appName,
        publicDir: path.join(appDir, 'public'),
        appUrl: `/${appName}`
      };
    });
}

function expressAppSetup(app) {
  appFrontendList().forEach(({ appName, publicDir, appUrl }) => {
    log.cyan(`Loading app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(appUrl)}`);
    app.use(appUrl, express.static(publicDir));
  });
}

async function init(program) {
  program.store.update({ appList: appFrontendList() });

  const appLoader = new AppLoader(program);

  if (!fs.existsSync(appsDir)) {
    log.gray("Apps directory doesn't exist");
  }

  appLoader
    .load(appList())
    .then(() => {
      program.emit('apps_loaded');
    })
    .catch(e => {
      log.red('Problem loading apps');
      log.red(e);
    });

  return { expressAppSetup };
}

export { init };
