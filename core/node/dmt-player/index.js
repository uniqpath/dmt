const rpcService = require('./rpc/service');

function init(program) {
  rpcService(program);
}

module.exports = {
  init
};
