import methods from './methods';
import setup from './setup';

function init(program) {
  program.registerActor({ actorName: 'search', methods, setup });
}

export default init;
