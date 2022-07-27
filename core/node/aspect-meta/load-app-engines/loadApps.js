import fs from 'fs';
import path from 'path';
import stripAnsi from 'strip-ansi';

import { log, colors } from 'dmt/common';

import { push } from 'dmt/notify';

class AppLoader {
  constructor(program) {
    this.program = program;
  }

  load(appList) {
    const promises = [];
    const appNames = [];

    appList.forEach(({ appDir }) => {
      const appEntryFilePath = path.join(appDir, 'index.js');
      const ssrHandlerFilePath = path.join(appDir, 'handler.js');

      if (fs.existsSync(appEntryFilePath) || fs.existsSync(ssrHandlerFilePath)) {
        const appName = path.basename(appDir);

        if (fs.existsSync(appEntryFilePath)) {
          appNames.push(appName);
          promises.push(this.tryLoadApp(this.program, appEntryFilePath, appName));
        }

        if (fs.existsSync(ssrHandlerFilePath)) {
          appNames.push(appName);
          promises.push(this.tryLoadSSRHandler(this.program, ssrHandlerFilePath, appName));
        }
      }
    });

    return new Promise((success, reject) => {
      const appLoadData = {};

      Promise.all(promises).then(returnObjects => {
        returnObjects.forEach((result, i) => {
          if (result) {
            const appName = appNames[i];
            appLoadData[appName] = appLoadData[appName] || {};

            if (result.ssrHandler) {
              appLoadData[appName].ssrHandler = result.ssrHandler;
            }

            if (result.initData) {
              appLoadData[appName].initData = result.initData;
            }
          }
        });

        success(appLoadData);
      });
    });
  }

  async tryLoadSSRHandler(program, ssrHandlerFilePath, appName) {
    return new Promise((success, reject) => {
      import(ssrHandlerFilePath).then(mod => {
        if (mod.handler) {
          success({ ssrHandler: mod.handler });
        } else {
          log.yellow(`⚠️ ${ssrHandlerFilePath} is not exporting { handler: ... }, ignoring ...`);
          success({});
        }
      });
    });
  }

  async tryLoadApp(program, appEntryFilePath, appName) {
    log.cyan(`Loading ${colors.magenta(appName)} app`);

    return new Promise((success, reject) => {
      this.loadApp(program, appEntryFilePath)
        .then(success)
        .catch(e => {
          const msg = `🪲 ⚠️  Problem loading ${colors.cyan(appName)} app — ${colors.red(e)}`;
          log.red(msg);

          program.exceptionNotify(stripAnsi(msg));

          log.magenta(`↳ ${colors.cyan('dmt-proc')} will continue without this app`);

          success();
        });
    });
  }

  async loadApp(program, appEntryFilePath) {
    return new Promise((success, reject) => {
      this.importComplex({ program, appEntryFilePath })
        .then(success)
        .catch(reject);
    });
  }

  importComplex({ program, appEntryFilePath }) {
    return new Promise((success, reject) => {
      import(appEntryFilePath)
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
                  success({ initData: returnObject });
                })
                .catch(reject);
            } else {
              success({ initData: promiseOrData });
            }
          } else {
            log.yellow(`⚠️ ${appEntryFilePath} is not exporting { init: ... }, ignoring ...`);
            success({});
          }
        })
        .catch(reject);
    });
  }
}

export default AppLoader;
