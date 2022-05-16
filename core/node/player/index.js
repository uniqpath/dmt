import createPlayer from './createPlayer';

import methods from './actor/methods';

function init(program) {
  const { paraSearch, player } = createPlayer(program);

  const setup = () => {
    return { paraSearch, player };
  };

  program.registerActor({ actorName: 'player', methods, setup });

  return { player };
}

export { init };
