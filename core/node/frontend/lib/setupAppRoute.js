import express from 'express';

import transformHtml from './transformHtml';

export default function setupAppRoute({ app, appName, publicDir }) {
  if (appName == 'dmt-search') {
    app.use(`/${appName}`, transformHtml);
  }

  app.use(`/${appName}`, express.static(publicDir));
}
