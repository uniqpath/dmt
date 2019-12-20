const Kalm = require('kalm');

class LanClient {
  constructor(serverIp, port = 6000) {
    this.client = Kalm.connect({
      hostname: serverIp,
      port,
      secretKey: 'yozoyozoot3242%$%233dfsdfsdfvlkj234o5hwf'
    });
  }

  on(event, callback) {
    this.client.on(event, callback);
  }

  subscribe(channel, callback) {
    this.client.subscribe(channel, callback);
  }

  send(channel, data) {
    this.client.write(channel, data);
  }
}

module.exports = LanClient;
