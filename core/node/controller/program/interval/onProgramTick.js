import dmt from 'dmt/common';
const { log } = dmt;

import determineIP from './determineIP';
import determineWifiAP from './determineWifiAP';

function onTick(program) {
  const now = Date.now();
  const apMode = program.apMode();

  program.store.removeFromSlotArrayElement('notifications', el => !el.expireAt || el.expireAt < now, { announce: false });

  const deviceUpdate = {
    devMachine: dmt.isDevMachine(),
    devCluster: dmt.isDevCluster(),
    apMode
  };

  const { environment } = program.state();

  if (environment && environment.expireAt && environment.expireAt < now) {
    log.magenta('Clearing expired enironment sensor data ...');
    program.store.clearSlot('environment', { announce: false });
  }

  const state = { device: deviceUpdate, log: log.bufferLines(log.REPORT_LINES) };

  determineIP(program);

  determineWifiAP(program);

  program.store.update(state, { announce: false });
}

export default onTick;
