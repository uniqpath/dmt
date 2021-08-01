import { log } from 'dmt/common';

import determineWifiAP from './determineWifiAP';

export default function onSlowTick(program) {
  determineWifiAP(program);
}
