const Server = require('./wsServer/server');
const Channel = require('./wsChannel/channel');

async function connect(options) {
  const connectFunction = await import('./wsClient-doublescript/nodejs/connect.js');
  connectFunction.default(options);
}

module.exports = {
  connect,
  Server,
  Channel
};

if (require.main === module) {
}
