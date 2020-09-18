import { promiseTimeout } from '../concurrency/index.js';

import connect from './connectNode.js';

const WAIT_TIME = 1000;

function waitAndContinue(options) {
  return new Promise((success, reject) => {
    connect(options).then(connector => {
      const connectedPromise = new Promise(success => connector.on('ready', success));

      promiseTimeout(WAIT_TIME, connectedPromise)
        .then(() => success(connector))
        .catch(() => success(connector));
    });
  });
}

export default waitAndContinue;
