import connect from './connectNode';

import { stopwatch } from '../utils';

function promiseTimeout(ms, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms} ms.`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

function waitAndContinue(options) {
  return new Promise((success, reject) => {
    const start = stopwatch.start();

    connect(options).then(connector => {
      const connectedPromise = new Promise(success => {
        connector.on('connected', () => {
          success();
        });
      });

      const handler = () => {
        success(connector, { duration: stopwatch.stop(start), connected: connector.isConnected() });
      };

      promiseTimeout(200, connectedPromise)
        .then(handler)
        .catch(handler);
    });
  });
}

export default waitAndContinue;
