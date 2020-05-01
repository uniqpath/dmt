import colors from 'colors';
import express from 'express';
import path from 'path';
import dmt from 'dmt/bridge';
import fs from 'fs';

import AppLoader from './loadApps';

const { scan, log } = dmt;

const appsDir = path.join(dmt.dmtPath, 'core/node/aspect-apps');

function appList() {
  return fs.existsSync(appsDir) ? scan.dir(appsDir, { onlyDirs: true }) : [];
}

function appFrontendList() {
  return appList()
    .filter(appDir => fs.existsSync(path.join(appDir, 'front/public')))
    .map(appDir => {
      const appName = path.basename(appDir);

      return {
        appName,
        publicDir: path.join(appDir, 'front/public'),
        appUrl: `/apps/${appName}`
      };
    });
}

function expressAppSetup(app) {
  appFrontendList().forEach(({ appName, publicDir, appUrl }) => {
    log.cyan(`Loading app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(appUrl)}`);
    app.use(`/apps/${appName}`, express.static(publicDir));
  });
}

async function init(program) {
  program.updateState({ appList: appFrontendList() });

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
