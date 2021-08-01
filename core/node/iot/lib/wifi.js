import wifi from 'node-wifi';

wifi.init({
  iface: null
});

export { runIfConnected, runIfHome };

function runIfConnected(fun) {
  wifi.getCurrentConnections((err, currentConnections) => {
    if (err) {
      console.log(err);
      return;
    }

    if (currentConnections.length >= 1) {
      fun();
    }
  });
}

function runIfHome(homeNetworks, fun) {
  wifi.getCurrentConnections((err, currentConnections) => {
    if (err) {
      console.log(err);
    }

    console.log(currentConnections);

    const network = currentConnections.find(conn => homeNetworks.find(net => net.name.toLowerCase() == conn.ssid.toLowerCase()));

    if (network) {
      fun(network);
    }
  });
}
