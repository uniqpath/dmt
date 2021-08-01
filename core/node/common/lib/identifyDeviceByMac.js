import { deviceRegistry } from './deviceRegistry';

import util from './util';
const { normalizeMac } = util;

export default function identifyDeviceByMac(_mac) {
  return deviceRegistry.find(({ mac }) => normalizeMac(mac) == normalizeMac(_mac));
}
