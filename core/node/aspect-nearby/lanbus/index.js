import LanBus from './lib/lanbus/index.js';

import UdpBus from './lib/udpbus/index.js';

function init(program) {
  const lanbus = new LanBus({ program });

  return { lanbus };
}

export { init, UdpBus };
