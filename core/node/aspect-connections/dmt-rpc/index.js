const Client = require('./lib/rpcClient');
const spawnServer = require('./lib/rpcServer');
const errorFormatter = require('./lib/rpcErrorFormatter');

module.exports = {
  Client,
  spawnServer,
  errorFormatter
};
