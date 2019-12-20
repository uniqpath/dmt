const fs = require('fs');
const colors = require('colors');
const dmt = require('dmt-bridge');

const netScan = require('./lib/net-scanner/netScan');
const netScanScreenOutput = require('./lib/net-scanner/screenOutput');

const currentNetworkDef = require('./lib/currentNetworkDef');
const gatewayMac = require('./lib/gatewayMac');
const networkInterfaces = require('./lib/networkInterfaces');
const netTools = require('./lib/netTools');

module.exports = {
  currentNetworkDef,
  networkInterfaces,
  gatewayMac,
  scan: netScan,
  privateIp: netTools.privateIp
};

if (require.main === module) {
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
}
