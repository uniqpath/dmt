import { log, colors, determineGUIPort } from 'dmt/common';

import express from 'express';
import fs from 'fs';

import { reloadSSRHandler, reloadAllSSRHandlers } from '../../apps-load/index.js';

import ssrProxy from './ssrProxy.js';

const ssrMiddlewares = new Map();
class Server {
  constructor(program) {
    this.program = program;

    this.app = express();

    program.on('gui:reload', () => {
      log.yellow('Gui reload event received — reloading all ssr handlers');
      reloadAllSSRHandlers({ server: this }).catch(e => {
        log.red('Error reloading some ssr handlers, should have received individual notifications and log entries');
        log.red(e);
      });
    });
  }

  setupRoutes(expressAppSetup) {
    expressAppSetup(this.app);
  }

  useDynamicSSR(appName, callback, reload = false) {
    if (typeof callback != 'function') return;
    const hasMiddleware = !!ssrMiddlewares.get(appName);
    ssrMiddlewares.set(appName, callback);

    if (reload && !hasMiddleware) {
      log.green(`💡 New SSR handler loaded: ${colors.magenta(appName)}`);
    } else if (reload) {
      log.cyan(`🔄 SSR handler reload — ${colors.magenta(appName)}`);
    }

    if (hasMiddleware) return;

    this.app
      .use(`/_${appName}`, (req, res, next) => {
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
          reloadSSRHandler({ server: this, appDir })
            .then(() => {
              res.end('success');
            })
            .catch(() => {
              res.end('rejected');
            });
        } else {
          log.red(`__dmt__reload appdir do not exist: ${appDir}`);
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
