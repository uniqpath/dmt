import WebSocket from 'ws';

import { EventEmitter } from '../utils/index.js';

import getRemoteIp from '../channel/getRemoteIp.js';
import Channel from '../channel/channel.js';

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

class WsServer extends EventEmitter {
  constructor({ ssl = false, port, verbose }) {
    super();

    process.nextTick(() => {
      const handleProtocols = (protocols, request) => {
        return protocols[0];
      };

      if (ssl) {
        import('fs').then(fs => {
          import('https').then(https => {
            const { certPath, keyPath } = ssl;

            const server = https.createServer({
              cert: fs.readFileSync(certPath),
              key: fs.readFileSync(keyPath)
            });

            this.wss = new WebSocket.Server({ server, handleProtocols });

            this.continueSetup({ verbose });

            server.listen(port);
          });
        });
      } else {
        this.wss = new WebSocket.Server({ port, handleProtocols });
        this.continueSetup({ verbose });
      }
    });
  }

  continueSetup({ verbose }) {
    this.wss.on('connection', (ws, req) => {
      ws.remoteIp = getRemoteIp(req);

      const channel = new Channel(ws, { verbose });

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
  }

  connectionList() {
    const list = this.enumerateConnections();

    return list.reverse();
  }

  enumerateConnections() {
    const list = [];

    this.wss.clients.forEach(ws => {
      list.push({
        ip: ws.remoteIp,
        readyState: ws.readyState,
        protocol: ws.protocol,
        protocolLane: ws.protocolLane
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
