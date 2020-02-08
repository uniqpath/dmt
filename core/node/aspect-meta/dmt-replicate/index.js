import colors from 'colors';
import express from 'express';

import dmt from 'dmt-bridge';
const { log } = dmt;

import serveDmtZip from './endpoints/serveDmtZip';
import serveInstallScript from './endpoints/serveInstallScript';
import serveLogo from './endpoints/serveLogo';
import serveWallpaper from './endpoints/serveWallpaper';

function serverInit({ app, program, port, replicateUserCodeTransform, replicateExcludedByUser }) {
  const files = [];

  app.get('/', (req, res) => {
    const ua = req.headers['user-agent'];
    const isCurl = ua && ua.startsWith('curl/');
    serveInstallScript({ req, res, isCurl, program, port });
  });

  app.get('/dmt.zip', (req, res) => {
    serveDmtZip({ req, res, program, files, replicateUserCodeTransform, replicateExcludedByUser });
  });

  app.get('/wallpaper.jpg', serveWallpaper);
  app.get('/logo.png', serveLogo);
}

function init(program) {
  program.on('user_core_ready', ({ replicateUserCodeTransform = null, replicateExcludedByUser = null } = {}) => {
    const app = express();
    const service = dmt.services('replicate');

    if (service) {
      const { port } = service;
      serverInit({ app, program, port, replicateUserCodeTransform, replicateExcludedByUser });
      app.listen(port);
      log.green(
        `${colors.magenta('dmt-replicate')} listening on ${port} — ${colors.cyan('to replicate to another machine (from that machine)')} ${colors.gray(
          '"curl THIS_MACHINE_IP:1111 | bash"'
        )}`
      );
    } else {
      log.gray(`${colors.red('✖')} ${colors.magenta('dmt-replicate')} service not activated because service entry / port is missing in global services.def`);
    }
  });
}

export { init };
