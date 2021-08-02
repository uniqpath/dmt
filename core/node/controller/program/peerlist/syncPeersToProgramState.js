import dmt from 'dmt/common';

const { log } = dmt;
import { push } from 'dmt/notify';

export default function syncPeersToProgramState({ program, connectorPool, port }) {
  const slotName = 'peerlist';

  program.store(slotName).makeArray();

  for (const peer of dmt.peerConnections()) {
    const { deviceName, address, deviceTag, syncState } = peer;

    program.store(slotName).pushToArray({ deviceName, address, deviceTag }, { announce: false });

    const selectorPredicate = peer => peer.deviceTag == deviceTag;

    connectorPool.getConnector({ host: address, port, deviceTag }).then(connector => {
      connector.attachObject('peerState', {
        set: peerState => {
          const versionCompareSymbol = dmt.versionCompareSymbol(peerState.dmtVersion);
          program.store(slotName).updateArrayElement(selectorPredicate, { versionCompareSymbol, peerState });
        }
      });

      program.store(slotName).updateArrayElement(selectorPredicate, { operational: connector.isReady() });

      connector.on('ready', () => {
        program.store(slotName).updateArrayElement(selectorPredicate, { operational: true });
      });

      connector.on('disconnect', () => {
        program.store(slotName).updateArrayElement(selectorPredicate, { operational: false });
      });
    });
  }
}
