import netScan from './lib/net-scanner/netScan';

import currentNetworkDef from './lib/currentNetworkDef';
import gatewayMac from './lib/gatewayMac';
import networkInterfaces from './lib/networkInterfaces';

import { privateIp } from './lib/netTools';

export { currentNetworkDef, networkInterfaces, gatewayMac, netScan as scan, privateIp };
