import methods from './methods/index.js';
import setup from './setup.js';

function init(program) {
  program.registerApi({ apiName: 'search', methods, setup });
}

export default init;
