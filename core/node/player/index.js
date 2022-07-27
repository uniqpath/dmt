import createPlayer from './createPlayer.js';

import methods from './apiPlayer/methods.js';

function init(program) {
  const { paraSearch, player } = createPlayer(program);

  const setup = () => {
    return { paraSearch, player };
  };

  program.registerApi({ apiName: 'player', methods, setup });

  return { player };
}

export { init };
