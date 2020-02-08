import fs from 'fs';
import path from 'path';
import colors from 'colors';
import dmt from 'dmt-bridge';

import arpscanner from './arpscanner-promise';
import { identify } from './deviceIdentifier';
import deviceDiffer from './deviceDiffer';
import deviceFilter from './deviceFilter';
import deviceSorter from './deviceSorter';

import currentNetworkDef from '../currentNetworkDef';
import networkInterfaces from '../networkInterfaces';

async function netScan(term = '', { rescan = true, silent = true } = {}) {
  try {
    const networkDef = await currentNetworkDef();
    const dmtStateDir = dmt.stateDir;
    const stateDir = networkDef ? path.join(dmtStateDir, networkDef.id.toLowerCase()) : dmtStateDir;

    if (!rescan) {
      const lastScanPath = path.join(stateDir, 'lastScan.json');

      if (fs.existsSync(lastScanPath)) {
        const devices = identify(JSON.parse(fs.readFileSync(lastScanPath)));
        return deviceSorter(deviceFilter(term, devices));
      }
    }

    const _interfaces = await networkInterfaces();
    if (!silent) {
      console.log(_interfaces);
    }

    const scanResults = await arpscanner({ interface: _interfaces[0].name });

    return deviceSorter(deviceFilter(term, identify(deviceDiffer(stateDir, scanResults))));
  } catch (err) {
    console.log(colors.red(err));
  }
}

export default netScan;
