import fs from 'fs';
import colors from 'colors';
import dmt from 'dmt-bridge';

import netScan from '../lib/net-scanner/netScan';
import netScanScreenOutput from '../lib/net-scanner/screenOutput';

import currentNetworkDef from '../lib/currentNetworkDef';
import gatewayMac from '../lib/gatewayMac';
import networkInterfaces from '../lib/networkInterfaces';

import { privateIp } from '../lib/netTools';

(async () => {
  const terms = process.argv.slice(2);

  if (terms[0] == '-h') {
    console.log(colors.yellow('Usage:'));
    console.log(`net ${colors.gray('normal network scan')}`);
    console.log(`net ${colors.green('--hidden')} ${colors.gray('show hidden devices (attr hidden: true)')}`);
    console.log(`net ${colors.green('--no-rescan')} ${colors.gray('show previous scan data without rescanning the network')}`);
    process.exit();
  }

  const dataDirPath = dmt.userDir;
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath);
  }

  let rescan = true;
  if (terms[0] == '--last') {
    rescan = false;
    terms.shift();
  }

  let searchTerm = '';
  if (terms.length > 0) {
    [searchTerm] = terms;
  }

  const devices = await netScan(searchTerm, { rescan, silent: false });
  netScanScreenOutput(devices);
})();
