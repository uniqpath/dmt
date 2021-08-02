import dmt from 'dmt/common';
const { log } = dmt;

import determineIP from './determineIP';
import determineWifiAP from './determineWifiAP';

function onTick(program) {
  const now = Date.now();
  const apMode = program.apMode();

  program.store('notifications').removeFromArray(el => !el.expireAt || el.expireAt < now, { announce: false });

  const deviceUpdate = {
    devMachine: dmt.isDevMachine(),
    devUser: dmt.isDevUser(),
    apMode
  };

  const environment = program.store('environment').get();

  if (environment && environment.expireAt && environment.expireAt < now) {
    log.magenta('Clearing expired enironment sensor data ...');
    program.store('environment').remove({ announce: false });
  }

  determineIP(program);

  determineWifiAP(program);

  program.store('device').update(deviceUpdate, { announce: false });
  program.store('log').set(log.bufferLines(log.REPORT_LINES), { announce: false });
}

export default onTick;
