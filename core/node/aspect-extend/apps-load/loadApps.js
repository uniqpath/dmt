import fs from 'fs';
import path from 'path';
import stripAnsi from 'strip-ansi';

import { log, colors, program } from 'dmt/common';

export function loadApps(appList) {
  const promises = [];
  const appNames = [];
  const appDirs = [];
  const appEntries = [];

  appList.forEach(({ appDir }) => {
    const appEntryFilePath = path.join(appDir, 'index.js');
    const appEntrySubprogram = path.join(appDir, 'dmt/index.js');

    if (fs.existsSync(appEntryFilePath) || fs.existsSync(appEntrySubprogram)) {
      const appName = path.basename(appDir);

      if (fs.existsSync(appEntryFilePath)) {
        appNames.push(appName);
        appDirs.push(appDir);
        appEntries.push(appEntryFilePath);
        promises.push(tryLoadApp(appEntryFilePath, appName));
      }

      if (fs.existsSync(appEntrySubprogram)) {
        appNames.push(appName);
        appDirs.push(appDir);
        appEntries.push(appEntrySubprogram);
        promises.push(tryLoadApp(appEntrySubprogram, appName));
      }
    }
  });

  return new Promise((success, reject) => {
    const appDefinitions = [];

    Promise.all(promises).then(returnObjects => {
      returnObjects.forEach((result, i) => {
        if (result) {
          const appName = appNames[i];
          const appDir = appDirs[i];
          const appEntry = appEntries[i];

          const { handler, expressAppSetup } = result;

          let hasSSRHandler = false;

          if (handler) {
            hasSSRHandler = true;
          }

          appDefinitions.push({ appName, appDir, appEntry, hasSSRHandler, ssrHandler: handler, expressAppSetup });
        }
      });

      success(appDefinitions);
    });
  });
}

async function tryLoadApp(appEntryFilePath, appName) {
  log.white(`🤖 Loading ${colors.magenta(appName)} subprogram`);

  return new Promise((success, reject) => {
    loadApp(appEntryFilePath)
      .then(success)
      .catch(e => {
        const msg = `🪲 ⚠️  Problem loading ${colors.cyan(appName)} app — ${colors.red(e)}`;
        log.red(msg);

        program.exceptionNotify(msg);

        log.magenta(`↳ ${colors.cyan('dmt-proc')} will continue without this app`);

        success();
      });
  });
}

async function loadApp(appEntryFilePath) {
  return new Promise((success, reject) => {
    importComplex(appEntryFilePath)
      .then(success)
      .catch(reject);
  });
}

export function importComplex(appEntryFilePath) {
  return new Promise((success, reject) => {
    import(`${appEntryFilePath}?${Math.random()}`)
      .then(mod => {
        let promiseOrData;
        let isPromise;

        if (mod.init) {
          try {
            promiseOrData = mod.init(program);
            isPromise = promiseOrData instanceof Promise;
          } catch (e) {
            reject(e);
            return;
          }

          if (isPromise) {
            const promise = promiseOrData;
            promise
              .then(returnObject => {
                success({ expressAppSetup: returnObject?.expressAppSetup, handler: returnObject?.handler });
              })
              .catch(reject);
          } else {
            success({ expressAppSetup: promiseOrData?.expressAppSetup, handler: promiseOrData?.handler });
          }
        } else {
          log.yellow(`⚠️ ${appEntryFilePath} is not exporting { init: ... }, ignoring ...`);
          success({});
        }
      })
      .catch(reject);
  });
}
