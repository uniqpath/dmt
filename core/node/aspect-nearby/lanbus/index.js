import LanBus from './lib/lanbus';

import UdpBus from './lib/udpbus';

function init(program) {
  const lanbus = new LanBus({ program });

  return { lanbus };
}

export { init, UdpBus };
