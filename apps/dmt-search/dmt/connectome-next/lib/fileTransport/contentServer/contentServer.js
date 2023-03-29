import fs from 'fs';
import path from 'path';
import { decode } from '../fiberHandle/encodePath.js';


import { log, colors } from 'dmt/common';

import { push } from 'dmt/notify';

import checkPermission from './checkPermission.js';

// function log(...args) {
//   console.log(...args);
// }

function fileNotFound({ providerAddress, fileName, res, host }) {
  log.red(`File not found: ${providerAddress} -- ${fileName}`);
  // TODO!! won't work on localhost!! /home ... ?q ... is wrong!
  let pre = '';
  if (host.startsWith('localhost')) {
    pre = 'apps/search/';
  }

  res.redirect(`/${pre}?q=${fileName}&error=file_not_found`); // TODO uri encode fileName !
  //res.status(404).send(`File not found -- ${fileName}`);
}

// source: https://github.com/archiverjs/node-archiver/blob/master/examples/express.js
function contentServer({ app }) {
  log.yellow('Starting content server ...');

  // if (!defaultPort) {
  //   throw new Error('Must provide default fiber port for content server ...');
  // }

  app.use('/file', (req, res) => {
    const { place } = req.query;

    const { host } = req.headers;

    //log.yellow(`Received content request ${place}`);

    if (place && place.includes('-')) {
      const [providerAddress, _directory] = place.split('-');
      const directory = decode(_directory);

      const fileName = decodeURIComponent(req.path.slice(1));
      const filePath = path.join(directory, fileName);

      // we only serve files for default content (for now?)
      if (!checkPermission({ directory })) {
        // todo: change to something else? -- perhaps not! it's very suitable message
        // and it masks the permission reason so that attacker cannot guess if directory actually does not exist
        // or it's just not in default content!
        log.red(`Prevented unauthorized file access - ${colors.gray(`Directory ${colors.yellow(directory)} is not exposed in default content`)}`);
        fileNotFound({ providerAddress, fileName, res, host });
        return;
      }

      // if (emitter) {
      //   emitter.emit('file_request', { providerAddress, filePath, host });
      // }

      // LOCAL FILE
      if (providerAddress == 'localhost') {
        if (fs.existsSync(filePath)) {
          // todo: somehow fix repeated use, mp3, avi etc.
          if (['.pdf', '.epub', '.txt'].includes(path.extname(filePath))) {
            push.notify(`Serving ${fileName} (${filePath})`);
          }
          res.sendFile(filePath);
        } else {
          fileNotFound({ providerAddress, fileName, res, host }); // will this work? test
        }

        return;
      }

      // FILE COMING OVER ENCRYPTED FIBER

      res.status(404).send('This feature is on hold -- streaming files over encrypted fibers');
    } else {
      res.status(404).send('Wrong file reference format, should be [ip]-[encodedRemoteDir]');
    }
  });
}

export default contentServer;
