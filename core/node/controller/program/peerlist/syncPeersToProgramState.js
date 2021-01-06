import dmt from 'dmt/bridge';

export default function syncPeersToProgramState({ program, connectorPool, port }) {
  const slotName = 'peerlist';

  program.store.replaceSlot(slotName, []);

  for (const peer of dmt.peerConnections()) {
    const { deviceName, address, deviceTag } = peer;

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
}
