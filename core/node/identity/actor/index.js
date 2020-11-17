import methods from './methods';
import setup from './setup';

function init(program) {
  program.registerActor({ actorName: 'identity', methods, setup }, { restrictToLocal: true });
}

export default init;
