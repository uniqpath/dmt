import { log, peerConnections, versionCompareSymbol } from 'dmt/common';
import { push } from 'dmt/notify';

function onReconnect({ connector, slotName, program, selectorPredicate }) {
  connector
    .remoteObject('dmt')
    .call('version')
    .then(dmtVersion => {
      const versionCompareSymbol = versionCompareSymbol(dmtVersion);
      program.store(slotName).updateArrayElements(selectorPredicate, { versionCompareSymbol, dmtVersion });
    })
    .catch(e => {});

  program.store(slotName).updateArrayElements(selectorPredicate, { ready: connector.isReady() });
}

export default function syncPeersToProgramState({ program, connectorPool, port }) {
  const slotName = 'peerlist';

  program.store(slotName).makeArray();

  for (const peer of peerConnections()) {
    const { deviceName, address, deviceTag } = peer;

    let endpoint;
    if (address.endsWith('/ws')) {
      endpoint = `wss://${address}`;
    }

    program.store(slotName).push({ deviceName, address, deviceTag }, { announce: false });

    const selectorPredicate = peer => peer.deviceTag == deviceTag;

    connectorPool.getConnector({ endpoint, host: address, port, deviceTag }).then(connector => {
      connector.on('ready', () => {
        onReconnect({ connector, slotName, program, selectorPredicate });
      });

      connector.on('disconnect', () => {
        program.store(slotName).updateArrayElements(selectorPredicate, { ready: false });
      });
    });
  }
}
