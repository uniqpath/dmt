import dmt from 'dmt/bridge';

function compareVersionsSymbol(dmtVersion) {
  const compareVersions = dmt.compareDmtVersions(dmtVersion, dmt.dmtVersion());

  if (compareVersions > 0) {
    return '↑';
  }

  if (compareVersions < 0) {
    return '↓';
  }

  return '';
}

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
          const sameVersion = dmt.dmtVersion() == peerState.dmtVersion;
          const versionCompareSymbol = compareVersionsSymbol(peerState.dmtVersion);
          program.store.updateSlotArrayElement(slotName, selectorPredicate, { sameVersion, versionCompareSymbol, peerState });
        }
      });

      program.store.updateSlotArrayElement(slotName, selectorPredicate, { connected: connector.isReady() });

      connector.on('ready', () => {
        program.store.updateSlotArrayElement(slotName, selectorPredicate, { connected: true });
      });

      connector.on('disconnect', () => {
        program.store.updateSlotArrayElement(slotName, selectorPredicate, { connected: false });
      });
    });
  }
}
