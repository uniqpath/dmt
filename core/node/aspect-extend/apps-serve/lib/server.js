import { log, colors, determineGUIPort } from 'dmt/common';

import express from 'express';
import fs from 'fs';

import loadApps from '../../apps-load/loadApps.js';

import ssrProxy from './ssrProxy.js';

const ssrMiddlewares = new Map();
class Server {
  constructor(program) {
    this.program = program;

    this.app = express();
  }

  setupRoutes(expressAppSetup) {
    expressAppSetup(this.app);
  }

  useDynamicSSR(appName, callback, reload = false) {
    if (typeof callback != 'function') return;
    const hasMiddleware = !!ssrMiddlewares.get(appName);
    ssrMiddlewares.set(appName, callback);

    if (reload & !hasMiddleware) {
      log.green('dmt new ssr app: ' + appName);
    } else if (reload) {
      log.green('dmt ssr app reload: ' + appName);
    }

    if (hasMiddleware) return;

    this.app
      .use(`/_${appName}`, function(req, res, next) {
        const callback = ssrMiddlewares.get(appName);
        if (callback) {
          return callback(req, res, next);
        }
        next();
      })
      .use(`/${appName}`, ssrProxy(appName));
  }

  listen() {
    const port = determineGUIPort();

    if (!port) {
      throw new Error('Gui port is not properly specified! Please specify in services.def');
    }

    this.app
      .get('/__dmt__reload', (req, res) => {
        const appDir = req.query.app;
        if (fs.existsSync(appDir)) {
          loadApps([{ appDir }])
            .then(appDefinations => {
              for (const appName in appDefinations) {
                const ssrHandler = appDefinations[appName]?.ssrHandler;
                if (ssrHandler) {
                  this.useDynamicSSR(appName, ssrHandler, true);
                }
              }
              res.end('success');
            })
            .catch(err => {
              log.red(err.message || err);
              res.end('rejected');
            });
        } else {
          log.red('__dmt__reload appdir do not exist: ' + appDir);
          res.end('rejected');
        }
      })
      .listen(port, () => {
        log.cyan('--------------------------------------------------');
        log.cyan(`💡🚀🎸 OPEN DMT IN BROWSER → ${colors.magenta(`http://localhost:${port}`)}`);
        log.cyan('--------------------------------------------------');

        this.program.slot('device').update({ actualGuiPort: port }, { announce: false });
      })
      .on('error', () => {
        throw new Error(`Failed to listen at gui port ${port}`);
      });
  }
}

export default Server;
