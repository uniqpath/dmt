const EventEmitter = require('events');
const WebSocket = require('ws');

const dmt = require('dmt-bridge');
const { log } = dmt;

const Channel = require('../wsChannel/channel');

const getRemoteIp = require('../wsChannel/getRemoteIp');

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

function stringify(strOrJson) {
  return typeof strOrJson == 'string' ? strOrJson : JSON.stringify(strOrJson);
}

class WsServer extends EventEmitter {
  init({ port }) {
    this.wss = new WebSocket.Server({ port });

    this.wss.on('connection', ws => {
      const channel = new Channel(ws);

      this.emit('connection', channel);

      ws.isAlive = true;
      ws.on('pong', heartbeat);

      ws.on('message', message => {
        if (ws.terminated) {
          return;
        }

        ws.isAlive = true;

        if (message == 'ping') {
          ws.send('pong');
          return;
        }

        try {
          const { deviceId } = JSON.parse(message);
          if (deviceId) {
            channel.emit('ident', { deviceId });
            return;
          }
        } catch (Error) {}

        this.emit('message', message);
        channel.emit('message', message);
      });
    });

    this.periodicCleanupAndPing();
  }

  sendAllChannels(message) {
    this.wss.clients.forEach(ws => {
      try {
        ws.send(stringify(message));
      } catch (e) {
        ws.isAlive = false;
      }
    });
  }

  enumerateConnections() {
    let num = 0;
    const list = [];

    this.wss.clients.forEach(ws => {
      num += 1;
      list.push({
        ip: getRemoteIp(ws)
      });
    });

    if (list.length > 0) {
      list.push({ num });
    }

    return list.reverse();
  }

  periodicCleanupAndPing() {
    this.wss.clients.forEach(ws => {
      if (ws.terminated) {
        return;
      }

      if (ws.isAlive === false) {
        log.debug('terminating socket');
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(noop);
    });

    setTimeout(() => {
      this.periodicCleanupAndPing();
    }, 10000);
  }
}

module.exports = WsServer;
