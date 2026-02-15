import methods from './methods.js';
import setup from './setup.js';

function init(program) {
  program.registerApi({ apiName: 'controller', methods, setup }, { restrictToLocal: true });
}

export default init;
