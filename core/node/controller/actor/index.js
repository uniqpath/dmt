import actions from './actions';
import setup from './setup';

const actorName = 'controller';

function init(program) {
  program.registerActor({ actorName, actions, setup });
}

export default init;
