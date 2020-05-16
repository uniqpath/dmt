import connect from './connectNode';

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
    connect(options).then(connector => {
      const connectedPromise = new Promise(success => connector.on('ready', success));

      promiseTimeout(500, connectedPromise)
        .then(() => success(connector))
        .catch(() => success(connector));
    });
  });
}

export default waitAndContinue;
