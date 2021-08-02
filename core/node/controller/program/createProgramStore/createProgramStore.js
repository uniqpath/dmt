import dmt from 'dmt/common';
const { def } = dmt;

import { saveState, loadState } from './statePersist';

import { reduceSizeOfStateForGUI as omitStateFn } from 'dmt/gui';

import { SlottedStore } from 'dmt/connectome-stores';

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
      devUser: dmt.isDevUser(),
      dmtVersion: dmt.dmtVersion(),
      nodejsVersion: process.version,
      platform: dmt.platformDescription(),
      tagline: device.tagline,
      apMode: program.apMode(),
      bootedAt: Date.now()
    }
  };

  const store = new SlottedStore(initState, { saveState, loadState, omitStateFn, removeStateChangeFalseTriggers });

  if (program.apMode()) {
    store.slot('device').update({ apInfo: dmt.apInfo() }, { announce: false });
  }

  if (def.isTruthy(device.demo)) {
    store.slot('device').update({ demoDevice: device.demo }, { announce: false });
  } else {
    store.slot('device').removeKey('demoDevice', { announce: false });
  }

  if (dmt.keypair()) {
    store.slot('device').update({ deviceKey: dmt.keypair().publicKeyHex }, { announce: false });
  }

  const guiServiceDef = dmt.services('gui');
  store.slot('services').update({ gui: guiServiceDef }, { announce: false });

  if (def.isTruthy(device.serverMode)) {
    store.slot('device').update({ serverMode: true }, { announce: false });
  } else {
    store.slot('device').removeKey('serverMode', { announce: false });
  }

  if (device.subnet) {
    store.slot('device').update({ subnet: device.subnet }, { announce: false });
  }

  store.slot('notifications').makeArray();
  store.slot('recentSearchQueries').makeArray();

  return store;
}
