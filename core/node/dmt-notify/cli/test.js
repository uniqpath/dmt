const fs = require('fs');
const path = require('path');
const colors = require('colors');

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
const dmt = require('dmt-bridge');

const device = dmt.parseDeviceDef('device');
console.log(JSON.stringify(device, null, 2));

(async () => {
  const net = require('dmt-net');
  const devices = await net.scanNetwork();
  console.log(devices);
})();
