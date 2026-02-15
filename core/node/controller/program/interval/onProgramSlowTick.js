import determineWifiAP from './determineWifiAP.js';
import osUptime from './osUptime.js';

export default function onSlowTick(program) {
  determineWifiAP(program);
  osUptime(program);
}
