import dmt from 'dmt/bridge';
const { def } = dmt;

import Store from '../state/store';

export default function initStore(program, device) {
  const store = new Store(program, {
    initState: {
      controller: {
        deviceName: device.id,
        devMachine: dmt.isDevMachine(),
        devCluster: dmt.isDevCluster(),
        dmtVersion: dmt.dmtVersion(),
        apMode: program.apMode(),
        bootedAt: Date.now()
      },
      swarm: {}
    }
  });

  if (program.apMode()) {
    store.updateState({ controller: { apInfo: dmt.apInfo() } }, { announce: false });
  }

  if (def.isTruthy(device.demo)) {
    store.updateState({ controller: { demoDevice: device.demo } }, { announce: false });
  } else {
    store.removeStoreElement({ storeName: 'controller', key: 'demoDevice' }, { announce: false });
  }

  if (dmt.keypair()) {
    store.updateState({ controller: { deviceKey: dmt.keypair().publicKeyHex } }, { announce: false });
  }

  const guiServiceDef = dmt.services('gui');
  store.updateState({ services: { gui: guiServiceDef } }, { announce: false });

  if (def.isTruthy(device.serverMode)) {
    store.updateState({ controller: { serverMode: true } }, { announce: false });
  } else {
    store.removeStoreElement({ storeName: 'controller', key: 'serverMode' }, { announce: false });
  }

  return store;
}
