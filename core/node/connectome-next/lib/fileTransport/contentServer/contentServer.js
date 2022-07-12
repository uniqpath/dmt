import fs from 'fs';
import path from 'path';
import { decode } from '../fiberHandle/encodePath.js';

import { log, colors } from 'dmt/common';

import { push } from 'dmt/notify';

import checkPermission from './checkPermission';

function fileNotFound({ providerAddress, fileName, res, host }) {
  log.red(`File not found: ${providerAddress} -- ${fileName}`);
  let pre = '';
  if (host.startsWith('localhost')) {
    pre = 'apps/search/';
  }

  res.redirect(`/${pre}?q=${fileName}&error=file_not_found`);
}

function contentServer({ app, connectorPool, defaultPort, emitter }) {
  log.yellow('Starting content server ...');

  if (!defaultPort) {
    throw new Error('Must provide default fiber port for content server ...');
  }

  app.use('/file', (req, res) => {
    const { place } = req.query;

    const { host } = req.headers;

    if (place && place.includes('-')) {
      const [providerAddress, _directory] = place.split('-');
      const directory = decode(_directory);

      const fileName = decodeURIComponent(req.path.slice(1));
      const filePath = path.join(directory, fileName);

      if (!checkPermission({ directory })) {
        log.red(`Prevented unauthorized file access - ${colors.gray(`Directory ${colors.yellow(directory)} is not exposed in default content`)}`);
        fileNotFound({ providerAddress, fileName, res, host });
        return;
      }

      if (providerAddress == 'localhost') {
        if (fs.existsSync(filePath)) {
          if (['.pdf', '.epub', '.txt'].includes(path.extname(filePath))) {
            push.notify(`Serving ${fileName} (${filePath})`);
          }
          res.sendFile(filePath);
        } else {
          fileNotFound({ providerAddress, fileName, res, host });
        }

        return;
      }

      res.status(404).send('This feature is on hold -- streaming files over encrypted fibers');
    } else {
      res.status(404).send('Wrong file reference format, should be [ip]-[encodedRemoteDir]');
    }
  });
}

export default contentServer;
