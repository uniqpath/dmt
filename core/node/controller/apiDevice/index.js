import methods from './methods.js';

function init(program) {
  program.registerApi({ apiName: 'device', methods }, { restrictToLocal: true });
}

export default init;
