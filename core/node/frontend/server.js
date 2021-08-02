import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

import express from 'express';

import setupRedirects from './lib/setupRedirects';
import setupAppRoute from './lib/setupAppRoute';
class Server {
  constructor({ program, appList, appInitResults }) {
    this.program = program;

    this.app = express();

    for (const [appName, initResult] of appInitResults) {
      if (initResult?.express) {
        log.cyan(`Loading SRR app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(`/${appName}`)}`);
        this.app.use(`/${appName}`, initResult.express);
      } else {
        const appMatch = appList.find(appInfo => appInfo.appName == appName);
        setupAppRoute({ app: this.app, appName, publicDir: appMatch.publicDir });
      }
    }

    setupRedirects({ app: this.app });
  }

  // apps should be able to set this, probably through exporting a list from their index.js ?
  listen(port) {
    if (!port) {
      throw new Error('Frontend server port is not properly specified! Please specify in services.def');
    }

    this.app
      .listen(port, () => {
        log.magenta('-------------------------------------------------');
        log.magenta(`💡🚀🎸 OPEN DMT FRONTEND → ${colors.magenta(`http://localhost:${port}`)}`);
        log.magenta('-------------------------------------------------');
        //   desktop.notify('OPEN DMT IN BROWSER', `🚀🎸 http://localhost:${port}`);
      })
      .on('error', () => {
        throw new Error(`Failed to listen at frontend port ${port}`);
      });
  }
}

export default Server;
