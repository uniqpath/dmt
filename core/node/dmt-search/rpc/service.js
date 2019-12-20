const definition = require('./defineService');
const setup = require('./setupService');

const serviceName = 'search';

function init(program) {
  program.registerRpcService({ serviceName, definition, setup });
}

module.exports = init;
