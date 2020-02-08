import actions from './actions';
import setup from './setupService';

const serviceName = 'player';

function init(program) {
  program.registerRpcService({ serviceName, actions, setup });
}

export default init;
