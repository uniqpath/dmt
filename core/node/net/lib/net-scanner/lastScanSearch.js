import fs from 'fs';
import path from 'path';

import { colors, dmtStateDir } from 'dmt/common';

import { identify } from './deviceIdentifier.js';
import currentNetworkDef from '../currentNetworkDef.js';

(async () => {
  const networkDef = await currentNetworkDef();
  const stateDir = networkDef ? path.join(dmtStateDir, networkDef.id.toLowerCase()) : dmtStateDir;

  const lastScanPath = path.join(stateDir, 'lastScan.json');

  if (fs.existsSync(lastScanPath)) {
    const devices = identify(JSON.parse(fs.readFileSync(lastScanPath)));

    const term = process.argv[2];

    if (!term) {
      console.log(colors.red('Please provide a device name'));
    } else {
      const matches = devices.filter(d => d.name && d.name.toLowerCase().indexOf(term.toLowerCase()) > -1);

      if (matches.length > 0) {
        matches.sort((a, b) => a.name.length - b.name.length);

        const match = matches[0];

        Object.keys(match).forEach(field => console.log(`${field}: ${match[field]}`));
      }
    }
  } else {
    console.log(colors.red('Missing lastScan file'));
  }
})();
