const cliResolveIp = require('./lib/cliResolveIp');

const Nearby = require('./lib/nearby');

function init(program) {
  const nearby = new Nearby(program);

  program.on('lanbus:ready', lanbus => nearby.registerLanbus(lanbus));
}

module.exports = {
  init,
  cliResolveIp
};
