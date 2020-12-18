import firstConnectWaitAndContinue from '../connect/firstConnectWaitAndContinue.js';

import { compareValues } from '../../utils/sorting/sorting.js';

class ConnectorPool {
  constructor(options) {
    this.options = options;

    this.connectors = {};
    this.isPreparingConnector = {};
  }

  getConnector({ address, port, tag }) {
    const addressWithPort = `${address}:${port}`;

    if (!address || !port) {
      throw new Error(`Must provide both address and port: ${addressWithPort}`);
    }

    return new Promise((success, reject) => {
      if (this.connectors[addressWithPort]) {
        success(this.connectors[addressWithPort]);
        return;
      }

      if (this.isPreparingConnector[addressWithPort]) {
        setTimeout(() => {
          this.getConnector({ address, port, tag }).then(success);
        }, 10);
      } else {
        this.isPreparingConnector[addressWithPort] = true;

        firstConnectWaitAndContinue({ ...this.options, ...{ address, port, tag } }).then(connector => {
          this.connectors[addressWithPort] = connector;
          this.isPreparingConnector[addressWithPort] = false;

          success(connector);
        });
      }
    });
  }

  // 💡 this method here is outgoing connections list
  // 💡 ⚠️ and it has to have THE SAME properties as wsServer::enumerateConnections
  // 💡 (which is used to get incoming connections list)
  connectionList() {
    const list = Object.entries(this.connectors).map(([address, conn]) => {
      return {
        address,
        protocol: conn.protocol,
        lane: conn.lane,
        remotePubkeyHex: conn.remotePubkeyHex(),
        ready: conn.isReady(), // 💡 connected and agreed on shared key ... used to determine if we can already send via connector or "we wait for the next rouund"
        //💡 informative-nature only, not used for distributed system logic
        readyState: conn.connection && conn.connection.websocket ? conn.connection.websocket.readyState : '?', // 💡 underlying ws-connection original 'readyState' -- useful only for debugging purposes, otherwise it's just informative
        connectedAt: conn.connectedAt,
        lastMessageAt: conn.lastMessageAt
      };
    });

    const order = compareValues('protocol', 'lane');
    return list.sort(order);
  }
}

export default ConnectorPool;
