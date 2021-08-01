import colors from 'colors';
import express from 'express';
import path from 'path';
import dmt from 'dmt/common';
import fs from 'fs';

import AppLoader from './loadApps';

const { scan, log } = dmt;

const appsDir = path.join(dmt.dmtPath, 'apps');
const userAppsDir = path.join(dmt.userDir, 'apps');

function getSubdirs(directory) {
  return scan.dir(directory, { onlyDirs: true }).filter(dir => !['_dmt_deps'].includes(path.basename(dir)));
}

function systemAppList() {
  return fs.existsSync(appsDir) ? getSubdirs(appsDir) : [];
}

function userAppList() {
  return fs.existsSync(userAppsDir) ? getSubdirs(userAppsDir) : [];
}

function getAllApps() {
  const apps = userAppList().map(appDir => {
    return { appDir, isUserApp: true };
  });

  for (const appDir of systemAppList()) {
    const existingUserApp = apps.find(app => path.basename(app.appDir) == path.basename(appDir));

    if (existingUserApp) {
      log.red(`Warn: user app ${colors.yellow(path.basename(appDir))} hides system app with the same name, system app is not accessible`);
      existingUserApp.overridesSystemApp = true;
    } else {
      apps.push({ appDir });
    }
  }

  return apps;
}

const allApps = getAllApps();

function appFrontendList() {
  return allApps
    .filter(({ appDir }) => fs.existsSync(path.join(appDir, 'public')))
    .map(app => {
      const { appDir } = app;

      const appName = path.basename(appDir);

      return {
        ...app,
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
  program.store.replaceSlot('appList', appFrontendList());

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

export { init };
