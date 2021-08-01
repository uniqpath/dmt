import dmt from 'dmt/common';

const { log } = dmt;
import { push } from 'dmt/notify';

function onReconnect({ connector, slotName, program, selectorPredicate }) {
  connector
    .remoteObject('dmt')
    .call('version')
    .then(dmtVersion => {
      const versionCompareSymbol = dmt.versionCompareSymbol(dmtVersion);
      program.store(slotName).updateArrayElement(selectorPredicate, { versionCompareSymbol, dmtVersion });
    })
    .catch(e => {});

  program.store(slotName).updateArrayElement(selectorPredicate, { ready: connector.isReady() });
}

export default function syncPeersToProgramState({ program, connectorPool, port }) {
  const slotName = 'peerlist';

  program.store(slotName).makeArray();

  for (const peer of dmt.peerConnections()) {
    const { deviceName, address, deviceTag, syncState } = peer;

    let endpoint;
    if (address.endsWith('/ws')) {
      endpoint = `wss://${address}`;
    }

    program.store(slotName).pushToArray({ deviceName, address, deviceTag }, { announce: false });

    const selectorPredicate = peer => peer.deviceTag == deviceTag;

    connectorPool.getConnector({ endpoint, host: address, port, deviceTag }).then(connector => {
      onReconnect({ connector, slotName, program, selectorPredicate });

      connector.on('ready', () => {
        onReconnect({ connector, slotName, program, selectorPredicate });
      });

      connector.on('disconnect', () => {
        program.store(slotName).updateArrayElement(selectorPredicate, { ready: false });
      });
    });
  }
}
