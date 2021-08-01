import colors from 'colors';
import fs from 'fs';
import path from 'path';
import stripAnsi from 'strip-ansi';

import dmt from 'dmt/common';
const { log } = dmt;

import { push } from 'dmt/notify';

class AppLoader {
  constructor(program) {
    this.program = program;
  }

  async load(appList) {
    const promises = [];

    appList.forEach(({ appDir }) => {
      const appInit = path.join(appDir, 'backend/index.js');

      if (fs.existsSync(appInit)) {
        const appName = path.basename(appDir);
        promises.push(this.tryLoadApp(this.program, appInit, appName));
      }
    });

    return Promise.all(promises);
  }

  async tryLoadApp(program, appInit, appName) {
    log.cyan(`Loading app → ${colors.magenta(appName)} ${colors.cyan('backend')}`);

    return new Promise((success, reject) => {
      this.loadApp(program, appInit)
        .then(success)
        .catch(e => {
          const msg = `⚠️🙀 Problem loading ${colors.cyan(appName)} app — ${colors.red(e)}`;
          log.red(msg);
          push.notify(`${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)}`);

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
              .then(() => {
                success();
              })
              .catch(reject);
          } else {
            success();
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
