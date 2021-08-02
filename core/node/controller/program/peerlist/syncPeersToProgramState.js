import dmt from 'dmt/common';

const { log } = dmt;
import { push } from 'dmt/notify';

export default function syncPeersToProgramState({ program, connectorPool, port }) {
  const slotName = 'peerlist';

  program.store.replaceSlot(slotName, []);

  for (const peer of dmt.peerConnections()) {
    const { deviceName, address, deviceTag, syncState } = peer;

    program.store.pushToSlotArrayElement(slotName, { deviceName, address, deviceTag }, { announce: false });

    const selectorPredicate = peer => peer.deviceTag == deviceTag;

    connectorPool.getConnector({ address, port, deviceTag }).then(connector => {
      connector.attachObject('peerState', {
        set: peerState => {
          const versionCompareSymbol = dmt.versionCompareSymbol(peerState.dmtVersion);
          program.store.updateSlotArrayElement(slotName, selectorPredicate, { versionCompareSymbol, peerState });
        }
      });

      program.store.updateSlotArrayElement(slotName, selectorPredicate, { operational: connector.isReady() });

      connector.on('ready', () => {
        program.store.updateSlotArrayElement(slotName, selectorPredicate, { operational: true });
      });

      connector.on('disconnect', () => {
        program.store.updateSlotArrayElement(slotName, selectorPredicate, { operational: false });
      });
    });
  }

  program.on('slowtick', () => {
    for (const peer of dmt.peerConnections()) {
      const { address, deviceTag, syncState } = peer;

      if (syncState) {
        connectorPool.getConnector({ address, port, deviceTag }).then(connector => {
          if (connector.isReady()) {
            const deviceName = program.device.id;
            const deviceKey = dmt.keypair().publicKeyHex;
            let state;

            if (syncState == 'true') {
              state = program.store.state();
            } else {
              const slots = syncState.split(',').map(s => s.trim());
              state = {};
              for (const slotName of slots) {
                state[slotName] = program.store.get(slotName);
              }
            }

            connector
              .remoteObject('remoteState')
              .call('set', { deviceName, deviceKey, state })
              .catch(e => {});
          }
        });
      }
    }

    const slotName = 'remoteStates';
    const remoteStates = (program.store.get(slotName) || []).filter(entry => Date.now() - entry.updatedAt < 2 * dmt.globals.slowTickerPeriod * 1000);

    program.store.replaceSlot(slotName, remoteStates, { announce: false });
  });
}
