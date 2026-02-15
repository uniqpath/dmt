import { log } from 'dmt/common';
const slotName = 'deviceConnections';

import { getEndpointFromDomain } from './serverEndpoint.js';
import connectList from './connectList.js';

function onReconnect({ program, connector, selectorPredicate }) {
  program.slot(slotName).updateArrayElements(selectorPredicate, { ready: connector.isReady() });
}

export default function init({ program, connectorPool, port }) {
  program.slot(slotName).makeArray();

  program.slot(slotName).set([]);

  for (const peer of connectList()) {
    const { deviceName, address, deviceTag } = peer;

    const endpoint = getEndpointFromDomain(address);

    program.slot(slotName).push({ deviceName, address, deviceTag }, { announce: false });

    const selectorPredicate = peer => peer.deviceTag == deviceTag;

    connectorPool.getConnector({ endpoint, host: address, port, deviceTag }).then(connector => {
      connector.on('ready', () => {
        onReconnect({ program, connector, selectorPredicate });
      });

      connector.on('disconnect', () => {
        program.slot(slotName).updateArrayElements(selectorPredicate, { ready: false });
      });
    });
  }
}
