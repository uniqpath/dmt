import Nearby from './lib/nearby';

function init(program) {
  program.on('ready', () => {
    new Nearby(program);
  });
}

export { init };
