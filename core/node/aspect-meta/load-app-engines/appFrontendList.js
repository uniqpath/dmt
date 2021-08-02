import colors from 'colors';
import path from 'path';
import dmt from 'dmt/common';
import fs from 'fs';

const { scan, log } = dmt;

export const appsDir = path.join(dmt.dmtPath, 'apps');
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
          publicDir,
          appUrl: `/${appName}`
        };
      }

      return undefined;
    })
    .filter(Boolean);
}
