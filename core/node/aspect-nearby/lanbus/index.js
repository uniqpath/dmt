import LanBus from './lib/lanbus';

import UdpBus from './lib/udpbus';

function init(program) {
  program.setLanbus(new LanBus({ program }));
}

export { init, UdpBus };
