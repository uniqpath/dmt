import colors from 'colors';

import path from 'path';

import dmt from 'dmt-bridge';
const { log, def } = dmt;

import express from 'express';

class Server {
  constructor(program) {
    this.program = program;

    this.app = express();
  }

  setupRoutes() {
    const { appList } = this.program.state;

    if (!appList) {
      return;
    }

    const appInfo = appList.find(({ appName }) => appName == 'zeta');

    if (appInfo) {
      this.app.use('/', express.static(appInfo.publicDir));

      const commonAssetsDir = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core/common_assets');

      this.app.use('/img', express.static(path.join(commonAssetsDir, 'img')));
      this.app.use('/wallpapers', express.static(path.join(commonAssetsDir, 'wallpapers')));

      return true;
    }
  }

  listen() {
    if (this.setupRoutes()) {
      const description = '🌐 ZETA APP';

      const port = 2112;

      this.app
        .listen(port, () => {
          log.cyan('%s listening at http://%s:%s', colors.magenta(description) || 'Server', 'localhost', port);
        })
        .on('error', () => {
          throw new Error(`Failed to listen at gui port ${port}`);
        });
    }
  }
}

export default Server;
