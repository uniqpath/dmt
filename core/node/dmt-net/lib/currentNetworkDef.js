const dmt = require('dmt-bridge');
const getGatewayMac = require('./gatewayMac');

const { normalizeMac } = dmt.util;

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
