import dmt from 'dmt/common';
const { def } = dmt;

import { saveState, loadState } from './statePersist';

import { reduceSizeOfStateForGUI as omitStateFn } from 'dmt/gui';

import { ProgramStateStore } from 'dmt/connectome-stores';

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
      nodejsVersion: process.version,
      platform: dmt.platformDescription(),
      tagline: device.tagline,
      apMode: program.apMode(),
      bootedAt: Date.now()
    }
  };

  const store = new ProgramStateStore(initState, { saveState, loadState, omitStateFn, removeStateChangeFalseTriggers });

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

  if (device.subnet) {
    store.update({ device: { subnet: device.subnet } }, { announce: false });
  }

  if (!store.get('recentSearchQueries')) {
    store.replaceSlot('recentSearchQueries', [], { announce: false });
  }

  if (!store.get('notifications')) {
    store.replaceSlot('notifications', [], { announce: false });
  }

  return store;
}
