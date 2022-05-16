import ping from 'nodejs-tcp-ping';

import { log, stopwatch, promiseTimeout, colors } from 'dmt/common';

let counter = 0;

export default function doPing(target, TIMEOUT = 1500) {
  return new Promise((success, reject) => {
    const pingPromise = ping.tcpPing({
      attempts: 5,
      host: target,
      timeout: TIMEOUT
    });

    pingPromise
      .then(results => {
        if (results.filter(el => el.ping < TIMEOUT).length == 0) {
          const timeoutError = new Error('Timeout');
          timeoutError.code = `TIMEOUT ${TIMEOUT}ms`;
          reject(timeoutError);
        } else {
          success(results);
        }
      })
      .catch(e => {
        reject(e);
      });
  });
}
