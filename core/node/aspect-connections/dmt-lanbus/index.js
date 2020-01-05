const LanBus = require('./lib/lanbus');

const UdpBus = require('./lib/udpbus');

function init(program) {
  return { bus: new LanBus({ program }) };
}

module.exports = {
  init,
  UdpBus
};
