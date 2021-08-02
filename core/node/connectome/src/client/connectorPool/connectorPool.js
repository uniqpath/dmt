import firstConnectWaitAndContinue from '../connect/firstConnectWaitAndContinue.js';

import { orderBy } from '../../utils/sorting/sorting.js';

import ReadableStore from '../../stores/front/helperStores/readableStore.js';

class ConnectorPool extends ReadableStore {
  constructor(options) {
    super({ connectionList: [] });

    this.options = options;

    this.connectors = {};
    this.isPreparingConnector = {};
  }

  getConnector({ host, port, tag }) {
    const hostWithPort = `${host}:${port}`;

    if (!host || !port) {
      throw new Error(`Must provide both host and port: ${hostWithPort}`);
    }

    return new Promise((success, reject) => {
      if (this.connectors[hostWithPort]) {
        success(this.connectors[hostWithPort]);
        return;
      }

      if (this.isPreparingConnector[hostWithPort]) {
        setTimeout(() => {
          this.getConnector({ host, port, tag }).then(success);
        }, 10);
      } else {
        this.isPreparingConnector[hostWithPort] = true;

        firstConnectWaitAndContinue({ ...this.options, ...{ host, port, tag } }).then(connector => {
          this.connectors[hostWithPort] = connector;
          this.isPreparingConnector[hostWithPort] = false;

          this.setupConnectorReactivity(connector);

          success(connector);
        });
      }
    });
  }

  setupConnectorReactivity(connector) {
    this.publishState();

    connector.on('ready', () => {
      this.publishState();
    });

    connector.on('disconnect', () => {
      this.publishState();
    });
  }

  publishState() {
    const connectionList = this.connectionList();

    connectionList.forEach(connection => {
      delete connection.lastMessageAt;
      delete connection.readyState;
    });

    this.state = { connectionList };
    this.announceStateChange();
  }

  // this method here is outgoing connections list
  // ⚠️ and it has to have THE SAME properties as wsServer::enumerateConnections
  // (which is used to get incoming connections list)
  connectionList() {
    const list = Object.entries(this.connectors).map(([address, conn]) => {
      return {
        address,
        protocol: conn.protocol,
        remotePubkeyHex: conn.remotePubkeyHex(),
        operational: conn.isReady(), // connected and agreed on shared key ... used to determine if we can already send via connector or "we wait for the next rouund"
        //informative-nature only, not used for distributed system logic
        readyState: conn.connection && conn.connection.websocket ? conn.connection.websocket.readyState : '?', // underlying ws-connection original 'readyState' -- useful only for debugging purposes, otherwise it's just informative
        connectedAt: conn.connectedAt,
        lastMessageAt: conn.lastMessageAt
      };
    });

    const order = orderBy('protocol');
    return list.sort(order);
  }
}

export default ConnectorPool;
