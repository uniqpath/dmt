import methods from './methods';
import setup from './setup';

function init(program) {
  program.registerActor({ actorName: 'player', methods, setup });
}

export default init;
