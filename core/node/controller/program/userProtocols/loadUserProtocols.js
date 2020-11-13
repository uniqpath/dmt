import colors from 'colors';
import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';

const { scan, log } = dmt;

import loadProtocol from './asyncLoadProtocol';

function loadUserProtocols(program) {
  const userProtocolsDir = path.join(dmt.userDir, 'core/node/protocols');

  if (fs.existsSync(userProtocolsDir)) {
    for (const dir of scan.dir(userProtocolsDir)) {
      const setupFilePath = path.join(dir, 'setup.js');

      if (fs.existsSync(setupFilePath)) {
        loadProtocol({ program, setupFilePath });
      } else {
        log.red(`⚠️  User protocol setup file ${colors.yellow(setupFilePath)} does not exist. Please create it or remove this directory.`);
      }
    }
  }
}

export default loadUserProtocols;
