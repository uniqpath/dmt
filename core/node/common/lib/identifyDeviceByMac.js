import { deviceRegistry } from './deviceRegistry.js';

import util from './util.js';
const { normalizeMac } = util;

export default function identifyDeviceByMac(_mac) {
  return deviceRegistry.find(({ mac }) => normalizeMac(mac) == normalizeMac(_mac));
}
