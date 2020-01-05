const dmt = require('dmt-bridge');
const { log } = dmt;
const getGatewayMac = require('./gatewayMac');

function normalizeMac(mac) {
  return mac.toLowerCase().replace(/\b0(\d|[a-f])\b/g, '$1');
}

async function currentNetworkDefEntry() {
  const networkDefs = dmt.userDef('networks').multi;
  if (networkDefs) {
    try {
      const gatewayMac = normalizeMac(await getGatewayMac());
      const foundNet = networkDefs.find(net => normalizeMac(net.gatewayMac) == gatewayMac);
      return foundNet;
    } catch (e) {
      return false;
    }
  }
}

module.exports = currentNetworkDefEntry;
