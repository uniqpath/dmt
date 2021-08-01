import { listify } from 'dmt/common';
import { currentNetworkDef } from '../index.js';
import wifi from 'node-wifi';

wifi.init({
  iface: null
});

wifi.getCurrentConnections((err, currentConnections) => {
  if (err) {
    console.log(err);
  }
  if (currentConnections.length > 0) {
    const conn = currentConnections[0];
    const { mac } = conn;

    currentNetworkDef()
      .then(network => {
        if (network.segments) {
          for (const segment of listify(network.segments.segment)) {
            for (const room of listify(segment.room)) {
              for (const ap of listify(room.ap)) {
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
