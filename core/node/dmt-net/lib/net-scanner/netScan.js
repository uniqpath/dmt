const fs = require('fs');
const path = require('path');
const colors = require('colors');

const arpscanner = require('./arpscanner-promise.js');
const deviceIdentifier = require('./deviceIdentifier');
const deviceDiffer = require('./deviceDiffer');
const deviceFilter = require('./deviceFilter');
const deviceSorter = require('./deviceSorter');

const currentNetworkDef = require('../currentNetworkDef');
const networkInterfaces = require('../networkInterfaces');

async function netScan(term = '', { rescan = true, silent = true } = {}) {
  try {
    const networkDef = await currentNetworkDef();
    const dmtStateDir = require('dmt-bridge').stateDir;
    const stateDir = networkDef ? path.join(dmtStateDir, networkDef.id.toLowerCase()) : dmtStateDir;

    if (!rescan) {
      const lastScanPath = path.join(stateDir, 'lastScan.json');

      if (fs.existsSync(lastScanPath)) {
        const devices = deviceIdentifier.identify(require(lastScanPath));
        return deviceSorter(deviceFilter(term, devices));
      }
    }

    const _interfaces = await networkInterfaces();
    if (!silent) {
      console.log(_interfaces);
    }

    const scanResults = await arpscanner({ interface: _interfaces[0].name });

    return deviceSorter(deviceFilter(term, deviceIdentifier.identify(deviceDiffer(stateDir, scanResults))));
  } catch (err) {
    console.log(colors.red(err));
  }
}

module.exports = netScan;
