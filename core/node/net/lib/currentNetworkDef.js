import { util, userDef } from 'dmt/common';
import getGatewayMac from './gatewayMac';

const { normalizeMac } = util;

async function currentNetworkDefEntry() {
  const networkDefs = userDef('networks').multi;
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

export default currentNetworkDefEntry;
