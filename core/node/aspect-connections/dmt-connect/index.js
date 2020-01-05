const Server = require('./wsServer/server');

async function connect(options) {
  const connectFunction = await import('./wsClient-doublescript/nodejs/connect.js');
  connectFunction.default(options);
}

module.exports = {
  connect,
  Server
};

if (require.main === module) {
}
