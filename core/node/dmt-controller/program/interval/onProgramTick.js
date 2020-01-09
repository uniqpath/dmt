const dmt = require('dmt-bridge');
const { log } = dmt;

const { networkInterfaces } = require('dmt-net');

function onTick(program) {
  const now = Date.now();
  const apMode = program.apMode();

  program.store.removeFromStateArray('notifications', el => !el.expireAt || el.expireAt < now, { announce: false });

  const controllerUpdate = {
    devMachine: dmt.isDevMachine(),
    devCluster: dmt.isDevCluster(),
    apMode
  };

  if (program.state.controller && program.state.controller.weather && program.state.controller.weather.expireAt < now) {
    controllerUpdate.weather = null;
  }

  const state = { controller: controllerUpdate, log: log.bufferLines(log.REPORT_LINES) };
  if (apMode) {
    const ip = dmt.accessPointIP;
    if (program.state.controller.ip != ip) {
      program.updateState({ controller: { ip } });
    }
  } else {
    networkInterfaces()
      .then(interfaces => {
        let ip;

        if (interfaces && interfaces.length >= 1) {
          ip = interfaces[0].ip_address;
        }

        if (program.state.controller.ip != ip) {
          program.updateState({ controller: { ip } });
        }
      })
      .catch(e => {});
  }

  program.updateState(state, { announce: false });
}

module.exports = onTick;
