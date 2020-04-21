import firstConnectWaitAndContinue from '../connect/firstConnectWaitAndContinue';

class FiberPool {
  constructor(options) {
    this.options = options;

    this.connectors = {};
    this.isPreparingConnector = {};
  }

  getFiber(ip) {
    return new Promise((success, reject) => {
      if (this.connectors[ip]) {
        success(this.connectors[ip]);
        return;
      }

      if (this.isPreparingConnector[ip]) {
        setTimeout(() => {
          this.getFiber(ip)
            .then(success)
            .catch(reject);
        }, 10);
      } else {
        this.isPreparingConnector[ip] = true;

        firstConnectWaitAndContinue({ ...this.options, ...{ address: ip } }).then(connector => {
          this.connectors[ip] = connector;
          this.isPreparingConnector[ip] = false;

          success(connector);
        });
      }
    });
  }
}

export default FiberPool;
