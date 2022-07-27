import { log } from 'dmt/common';

import determineWifiAP from './determineWifiAP.js';

export default function onSlowTick(program) {
  determineWifiAP(program);
}
