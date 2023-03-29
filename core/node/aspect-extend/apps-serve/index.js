import express from 'express';

import { log, colors } from 'dmt/common';

import { contentServer } from 'dmt/connectome-next';
import { appFrontendList } from 'dmt/apps-load';

import Server from './lib/server.js';
import setupRedirects from './lib/setupRedirects.js';

function getSymbol({ isDeviceApp, isUserApp }) {
  if (isUserApp) {
    return '👤';
  }
  if (isDeviceApp) {
    return '💻';
  }
}

function mountApps(appDefinitions, server) {
  return app => {
    const ssrApps = [];

    for (const { appName, expressAppSetup, ssrHandler } of appDefinitions) {
      if (ssrHandler) {
        server.useDynamicSSR(appName, ssrHandler);
        ssrApps.push(appName);
        log.cyan(`📐 Loading SRR app code for ${colors.magenta(appName)} at ${colors.gray(`/${appName}`)}`);
      } else if (expressAppSetup) {
        server.setupRoutes(expressAppSetup);
      }
    }

    appFrontendList().forEach(({ appName, publicDir, isDeviceApp, isUserApp }) => {
      const symbol = getSymbol({ isDeviceApp, isUserApp }) || '📃';
      if (!ssrApps.includes(appName)) {
        log.cyan(`${symbol} Loading static frontend for ${colors.magenta(appName)} at ${colors.gray(`/${appName}`)}`);
        app.use(`/${appName}`, express.static(publicDir));
      }
    });

    setupRedirects({ app });
  };
}

function init(program) {
  const server = new Server(program);

  program.on('apps_loaded', appDefinitions => {
    server.setupRoutes(mountApps(appDefinitions, server));

    server.setupRoutes(app => contentServer({ app }));

    server.listen();
  });
}

export { init };
