import { log, isDevMachine, isDevUser, apMode } from 'dmt/common';

import determineIP from './determineIP';

export default function onTick(program) {
  const now = Date.now();

  program.store('notifications').removeArrayElements(el => !el.expireAt || el.expireAt < now, { announce: false });

  const deviceUpdate = {
    devMachine: isDevMachine(),
    devUser: isDevUser(),
    apMode: apMode()
  };

  const environment = program.store('environment').get();

  if (environment && environment.expireAt && environment.expireAt < now) {
    program.store('environment').remove({ announce: false });
  }

  determineIP(program);

  program.store('device').update(deviceUpdate, { announce: false });
  program.store('log').set(log.bufferLines(log.REPORT_LINES), { announce: false });
}
