const definition = require('./defineService');
const setup = require('./setupService');

const serviceName = 'player';

function init(program) {
  program.registerRpcService({ serviceName, definition, setup });
}

module.exports = init;
