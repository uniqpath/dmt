import dmt from 'dmt/bridge';
const { log } = dmt;

import { networkInterfaces } from 'dmt/net';

function onTick(program) {
  const now = Date.now();
  const apMode = program.apMode();

  program.store.removeFromSlotArrayElement('notifications', el => !el.expireAt || el.expireAt < now, { announce: false });

  const deviceUpdate = {
    devMachine: dmt.isDevMachine(),
    devCluster: dmt.isDevCluster(),
    apMode
  };

  if (program.state().environment && program.state().environment.expireAt < now) {
    program.store.clearSlot('environment', { announce: false });
  }

  const state = { device: deviceUpdate, log: log.bufferLines(log.REPORT_LINES) };

  if (apMode) {
    const ip = dmt.accessPointIP;
    if (program.state().device.ip != ip) {
      program.store.update({ device: { ip } });
    }
  } else {
    networkInterfaces()
      .then(interfaces => {
        let ip;

        if (interfaces && interfaces.length >= 1) {
          ip = interfaces[0].ip_address;
        }

        if (program.state().device.ip != ip) {
          program.store.update({ device: { ip } });
        }
      })
      .catch(e => {});
  }

  program.store.update(state, { announce: false });
}

export default onTick;
