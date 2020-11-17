import firstConnectWaitAndContinue from '../connect/firstConnectWaitAndContinue.js';

import { compareValues } from '../utils/sorting/sorting.js';

class ConnectorPool {
  constructor(options) {
    this.options = options;

    this.connectors = {};
    this.isPreparingConnector = {};
  }

  getConnector(ip, port) {
    const ipWithPort = `${ip}:${port}`;

    if (!ip || !port) {
      throw new Error(`Must provide both ip and port: ${ipWithPort}`);
    }

    return new Promise((success, reject) => {
      if (this.connectors[ipWithPort]) {
        success(this.connectors[ipWithPort]);
        return;
      }

      if (this.isPreparingConnector[ipWithPort]) {
        setTimeout(() => {
          this.getConnector(ip, port)
            .then(success)
            .catch(reject);
        }, 10);
      } else {
        this.isPreparingConnector[ipWithPort] = true;

        firstConnectWaitAndContinue({ ...this.options, ...{ address: ip, port } }).then(connector => {
          this.connectors[ipWithPort] = connector;
          this.isPreparingConnector[ipWithPort] = false;

          if (connector.isReady()) {
            success(connector);
          } else {
            const e = new Error('Connector was not ready in time, please retry the request.');
            e.connector = connector;
            reject(e);
          }
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
        protocolLane: conn.protocolLane,
        remotePubkeyHex: conn.remotePubkeyHex(),
        ready: conn.isReady(), // 💡 connected and agreed on shared key ... used to determine if we can already send via connector or "we wait for the next rouund"
        //💡 informative-nature only, not used for distributed system logic
        readyState: conn.connection && conn.connection.websocket ? conn.connection.websocket.readyState : '?', // 💡 underlying ws-connection original 'readyState' -- useful only for debugging purposes, otherwise it's just informative
        connectedAt: conn.connectedAt,
        lastMessageAt: conn.lastMessageAt
      };
    });

    const order = compareValues('protocol', 'protocolLane');
    return list.sort(order);
  }
}

export default ConnectorPool;
