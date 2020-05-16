import firstConnectWaitAndContinue from '../connect/firstConnectWaitAndContinue';

class FiberPool {
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
}

export default FiberPool;
