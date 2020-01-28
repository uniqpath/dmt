const dmt = require('dmt-bridge');

const { wpaStatus, macosAirport } = require('./otherScripts');

function wifiAccessPointMAC() {
  if (dmt.isMacOS()) {
    return macosAirport();
  }

  if (dmt.isLinux) {
    return wpaStatus();
  }

  if (dmt.windows()) {
    console.log('TODO');
  }
}

module.exports = { wifiAccessPointMAC };
