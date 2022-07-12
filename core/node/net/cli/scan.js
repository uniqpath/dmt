import fs from 'fs';

import { colors, dmtUserDir as dataDirPath } from 'dmt/common';
import netScan from '../lib/net-scanner/netScan';
import netScanScreenOutput from '../lib/net-scanner/screenOutput';

(async () => {
  const terms = process.argv.slice(2);

  if (terms[0] == '-h') {
    console.log(colors.yellow('Usage:'));
    console.log(`net ${colors.gray('normal network scan')}`);
    console.log(`net ${colors.green('--hidden')} ${colors.gray('show hidden devices (attr hidden: true)')}`);
    console.log(`net ${colors.green('--no-rescan')} ${colors.gray('show previous scan data without rescanning the network')}`);
    process.exit();
  }

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
