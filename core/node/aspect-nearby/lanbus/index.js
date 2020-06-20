import LanBus from './lib/lanbus';

import UdpBus from './lib/udpbus';

function init(program) {
  return { bus: new LanBus({ program }) };
}

export { init, UdpBus };
