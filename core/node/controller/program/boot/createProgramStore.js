import dmt from 'dmt/bridge';
const { def } = dmt;

import { reduceSizeOfStateForGUI as omitStateFn } from 'dmt/gui';

import { Store } from 'dmt/store';

function removeStateChangeFalseTriggers(stateClone) {
  if (stateClone.nearbyDevices) {
    for (const deviceInfo of stateClone.nearbyDevices) {
      delete deviceInfo.staleDetectedAt;
      delete deviceInfo.lastSeenAt;
    }
  }

  return stateClone;
}

export default function createProgramStore(program) {
  const { device } = program;

  const initState = {
    device: {
      deviceName: device.id,
      devMachine: dmt.isDevMachine(),
      devCluster: dmt.isDevCluster(),
      dmtVersion: dmt.dmtVersion(),
      platform: dmt.platformDescription(),
      apMode: program.apMode(),
      bootedAt: Date.now()
    },
    notifications: []
  };

  const store = new Store({ initState, omitStateFn, stateFilePath: dmt.programStateFile, removeStateChangeFalseTriggers });

  if (program.apMode()) {
    store.update({ device: { apInfo: dmt.apInfo() } }, { announce: false });
  }

  if (def.isTruthy(device.demo)) {
    store.update({ device: { demoDevice: device.demo } }, { announce: false });
  } else {
    store.removeSlotElement({ slotName: 'device', key: 'demoDevice' }, { announce: false });
  }

  if (dmt.keypair()) {
    store.update({ device: { deviceKey: dmt.keypair().publicKeyHex } }, { announce: false });
  }

  const guiServiceDef = dmt.services('gui');
  store.update({ services: { gui: guiServiceDef } }, { announce: false });

  if (def.isTruthy(device.serverMode)) {
    store.update({ device: { serverMode: true } }, { announce: false });
  } else {
    store.removeSlotElement({ slotName: 'device', key: 'serverMode' }, { announce: false });
  }

  return store;
}
