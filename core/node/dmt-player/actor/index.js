import actions from './actions';
import setup from './setup';

const actorName = 'player';

function init(program) {
  program.registerActor({ actorName, actions, setup });
}

export default init;
