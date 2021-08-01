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
      const appInit = path.join(appDir, 'index.js');

      if (fs.existsSync(appInit)) {
        const appName = path.basename(appDir);
        appNames.push(appName);
        promises.push(this.tryLoadApp(this.program, appInit, appName));
      }
    });

    return new Promise((success, reject) => {
      Promise.all(promises).then(returnObjects => {
        success(returnObjects.map((result, i) => [appNames[i], result]));
      });
    });
  }

  async tryLoadApp(program, appInit, appName) {
    log.cyan(`Loading ${colors.magenta(appName)} APP ENGINE ${colors.gray('(aka. DMT ENGINE application hook/plugin)')}`);

    return new Promise((success, reject) => {
      this.loadApp(program, appInit)
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

  async loadApp(program, appInit) {
    return new Promise((success, reject) => {
      this.importComplex({ program, appInit })
        .then(success)
        .catch(reject);
    });
  }

  importComplex({ program, appInit }) {
    return new Promise((success, reject) => {
      import(appInit)
        .then(app => {
          let promiseOrData;
          let isPromise;

          try {
            promiseOrData = app.init(program);
            isPromise = promiseOrData instanceof Promise;
          } catch (e) {
            reject(e);
            return;
          }

          if (isPromise) {
            const promise = promiseOrData;
            promise
              .then(returnObject => {
                success(returnObject);
              })
              .catch(reject);
          } else {
            success(promiseOrData);
          }
        })
        .catch(e => {
          reject(e);
          return;
        });
    });
  }
}

export default AppLoader;
