import colors from 'colors';

import express from 'express';

import dmt from 'dmt-bridge';
const { log } = dmt;

import { desktop } from 'dmt-notify';

import servingStrategy from './servingStrategy';

function listen({ program, name, description, port, expressOptions = {}, servingOptions = {}, redirects = {}, app }) {
  if (!app) {
    app = configureRedirects(servingStrategy(express(expressOptions), name, servingOptions), redirects);
  }

  app
    .listen(port, () => {
      log.green('%s listening at http://%s:%s', description || 'Server', 'localhost', port);

      log.cyan('------------------------------------------------------');
      log.cyan(`💡🚀🎸 OPEN DMT GUI IN BROWSER → ${colors.magenta(`http://localhost:${port}`)}`);
      log.cyan('------------------------------------------------------');

      if (dmt.user().disableStartNotification != 'true') {
        desktop.notify(`💡 OPEN DMT GUI IN BROWSER`, `🚀🎸 http://localhost:${port}`);
      }

      program.updateState({ controller: { actualGuiPort: port } }, { announce: false });
    })
    .on('error', e => {
      throw new Error(`Failed to listen at gui port ${port}`);
    });
}

function configureRedirects(app, redirects) {
  for (const source of Object.keys(redirects)) {
    const target = redirects[source];
    app.get(source, (req, res) => {
      res.redirect(target);
    });
  }

  return app;
}

export default listen;
