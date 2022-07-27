import netScan from './lib/net-scanner/netScan.js';

import currentNetworkDef from './lib/currentNetworkDef.js';
import gatewayMac from './lib/gatewayMac.js';
import networkInterfaces from './lib/networkInterfaces.js';

import { privateIp } from './lib/netTools.js';

export { currentNetworkDef, networkInterfaces, gatewayMac, netScan as scan, privateIp };
