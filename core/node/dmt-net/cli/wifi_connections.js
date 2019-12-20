const dmt = require('dmt-bridge');
const { log } = dmt;
const { currentNetworkDef } = require('../index');
const wifi = require('node-wifi');

wifi.init({
  iface: null
});

wifi.getCurrentConnections(function(err, currentConnections) {
  if (err) {
    console.log(err);
  }
  if (currentConnections.length > 0) {
    const conn = currentConnections[0];
    const mac = conn.mac;

    currentNetworkDef()
      .then(network => {
        if (network.segments) {
          for (const segment of dmt.listify(network.segments.segment)) {
            for (const room of dmt.listify(segment.room)) {
              for (const ap of dmt.listify(room.ap)) {
                if (ap == mac) {
                  console.log(`${network.id} ● ${segment.id} ● ${room.id} ● ${conn.frequency}`);
                }
              }
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  } else {
    console.log('not connected to wifi');
  }
});
