const colors = require('colors');
const Kalm = require('kalm');
const dmt = require('dmt-bridge');
const { log } = dmt;

class LanServer {
  listen() {
    this.server = Kalm.listen({
      port: 6000,
      secretKey: 'yozoyozoot3242%$%233dfsdfsdfvlkj234o5hwf'
    });

    log.write(colors.green(`LAN server listening...`));

    this.server.on('connection', client => {
      log.write(colors.magenta(`LAN SERVER CONNECTION`));
    });
  }

  broadcast(channel, data) {
    this.server.broadcast(channel, data);
  }
}

module.exports = LanServer;
