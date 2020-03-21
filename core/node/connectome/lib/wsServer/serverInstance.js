import WebSocket from 'ws';

import EventEmitter from '../emitter';

import getRemoteIp from '../wsChannel/getRemoteIp';
import Channel from '../wsChannel/channel';

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

class WsServer extends EventEmitter {
  constructor({ port }) {
    super();

    process.nextTick(() => {
      const handleProtocols = (protocols, request) => {
        return protocols[0];
      };

      this.wss = new WebSocket.Server({ port, handleProtocols });

      this.wss.on('connection', (ws, req) => {
        ws.remoteIp = getRemoteIp(req);

        const channel = new Channel(ws);

        channel.on('channel_closed', () => {
          this.emit('connection_closed', channel);
        });

        this.emit('connection', channel);

        ws.isAlive = true;
        ws.on('pong', heartbeat);

        ws.on('message', message => {
          if (ws.terminated) {
            return;
          }

          ws.isAlive = true;

          if (message == 'ping') {
            if (ws.readyState == ws.OPEN) {
              try {
                ws.send('pong');
              } catch (e) {}
            }
            return;
          }

          channel.messageReceived(message);
        });
      });

      this.periodicCleanupAndPing();
    });
  }

  connectionsList() {
    const list = this.enumerateConnections();

    list.push({ num: Object.keys(list).length });

    return list.reverse();
  }

  enumerateConnections() {
    const list = [];

    this.wss.clients.forEach(ws => {
      list.push({
        ip: ws.remoteIp,
        readyState: ws.readyState
      });
    });

    return list;
  }

  periodicCleanupAndPing() {
    this.wss.clients.forEach(ws => {
      if (ws.terminated) {
        return;
      }

      if (ws.isAlive === false) {
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

export default WsServer;
