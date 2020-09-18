import methods from './methods';
import setup from './setup';

function init(program) {
  program.registerActor({ actorName: 'device', methods, setup });
}

export default init;
