import fs from 'fs';
import path from 'path';

import { log, colors, dmtUserDir } from './dmtHelper';

function readJson(devicesFile) {
  let _devices = [];

  if (fs.existsSync(devicesFile)) {
    try {
      _devices = JSON.parse(fs.readFileSync(devicesFile));
    } catch (e) {
      log.yellow(`⚠️  Failed to parse ${colors.gray(devicesFile)}`);
      log.yellow(e);
    }
  }

  return _devices;
}

const devicesFile = path.join(dmtUserDir, 'devices/devices.json');

export const deviceRegistry = readJson(devicesFile);
