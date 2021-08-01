import path from 'path';
import fs from 'fs';

import { scan, log, colors, dmtPath, dmtUserDir, dmtHerePath } from 'dmt/common';

export const appsDir = path.join(dmtPath, 'apps');
const userAppsDir = path.join(dmtUserDir, 'apps');
const deviceAppsDir = path.join(dmtHerePath, 'apps');

function getSubdirs(directory) {
  return scan.dir(directory, { onlyDirs: true }).filter(dir => !['_dmt_deps'].includes(path.basename(dir)));
}

function systemAppList() {
  return fs.existsSync(appsDir) ? getSubdirs(appsDir) : [];
}

function userAppList() {
  return fs.existsSync(userAppsDir) ? getSubdirs(userAppsDir) : [];
}

function deviceAppList() {
  return fs.existsSync(deviceAppsDir) ? getSubdirs(deviceAppsDir) : [];
}

function getAllApps() {
  const apps = deviceAppList().map(appDir => {
    return { appDir, isDeviceApp: true };
  });

  for (const appDir of userAppList()) {
    const existingDeviceApp = apps.find(app => path.basename(app.appDir) == path.basename(appDir));

    if (existingDeviceApp) {
      log.red(`Warn: device app ${colors.yellow(path.basename(appDir))} hides user app with the same name, user app is not accessible`);
      existingDeviceApp.overridesUserApp = true;
    } else {
      apps.push({ appDir, isUserApp: true });
    }
  }

  for (const appDir of systemAppList()) {
    const existingDeviceApp = apps.find(app => path.basename(app.appDir) == path.basename(appDir));
    const existingUserApp = apps.find(app => path.basename(app.appDir) == path.basename(appDir));

    if (existingDeviceApp) {
      log.red(`Warn: device app ${colors.yellow(path.basename(appDir))} hides system app with the same name, system app is not accessible`);
      existingDeviceApp.overridesSystemApp = true;
    }

    if (existingUserApp) {
      log.red(`Warn: user app ${colors.yellow(path.basename(appDir))} hides system app with the same name, system app is not accessible`);
      existingUserApp.overridesSystemApp = true;
    }

    if (!existingDeviceApp && !existingUserApp) {
      apps.push({ appDir });
    }
  }

  return apps;
}

export const allApps = getAllApps();

function getAppStaticFrontend(appDir) {
  if (fs.existsSync(path.join(appDir, 'index.html'))) {
    return appDir;
  }

  const guiDir = path.join(appDir, 'gui');

  if (fs.existsSync(path.join(guiDir, 'index.html'))) {
    return guiDir;
  }
}

export function appFrontendList() {
  return allApps
    .map(app => {
      const { appDir } = app;

      const appName = path.basename(appDir);

      const publicDir = getAppStaticFrontend(appDir);

      if (publicDir) {
        return {
          ...app,
          appName,
          publicDir
        };
      }

      return undefined;
    })
    .filter(Boolean);
}
