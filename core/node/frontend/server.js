import { log, colors } from 'dmt/common';

import ssrProxy from './lib/ssrProxy.js';

import express from 'express';

import setupRedirects from './lib/setupRedirects.js';
class Server {
  constructor({ program, appList, appInitResults }) {
    this.program = program;

    this.app = express();

    const ssrApps = [];

    for (const [appName, { initData, ssrHandler }] of Object.entries(appInitResults)) {
      if (ssrHandler) {
        log.cyan(`Loading SRR handler → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(`/${appName}`)}`);
        this.app.use(`/_${appName}`, ssrHandler);
        this.app.use(`/${appName}`, ssrProxy(appName));
        ssrApps.push(appName);
      } else if (initData?.express) {
        log.cyan(`Loading SRR app → ${colors.magenta(appName)} ${colors.cyan('frontend')} at ${colors.gray(`/${appName}`)}`);
        this.app.use(`/${appName}`, initData.express);
        ssrApps.push(appName);
      }
    }

    appList.forEach(({ appName, publicDir }) => {
      if (!ssrApps.includes(appName)) {
        this.app.use(`/${appName}`, express.static(publicDir));
      }
    });

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
      })
      .on('error', () => {
        throw new Error(`Failed to listen at frontend port ${port}`);
      });
  }
}

export default Server;
