import WebSocket from 'ws';

import { EventEmitter } from '../../utils/index.js';

import getRemoteHost from '../channel/getRemoteHost.js';
import getRemoteIp from '../channel/getRemoteIp.js';
import Channel from '../channel/channel.js';

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

class WsServer extends EventEmitter {
  constructor({ port, server, verbose }) {
    super();

    process.nextTick(() => {
      if (server) {
        this.webSocketServer = new WebSocket.Server({ server });
      } else {
        this.webSocketServer = new WebSocket.Server({ port });
      }

      this.continueSetup({ verbose });
    });
  }

  continueSetup({ verbose }) {
    this.webSocketServer.on('connection', (ws, req) => {
      const channel = new Channel(ws, { verbose });

      channel._remoteIp = getRemoteIp(req);
      channel._remoteAddress = getRemoteHost(req);

      channel.connectedAt = Date.now();

      ws._connectomeChannel = channel;

      channel.on('disconnect', () => {
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

  // this method here is incoming connections list
  // ⚠️ and it has to have THE SAME properties as connectorPool::connectionList
  // (which is used to get outgoing connections list)
  enumerateConnections() {
    const list = [];

    this.webSocketServer.clients.forEach(ws => {
      list.push({
        address: ws._connectomeChannel.remoteAddress() || ws._connectomeChannel.remoteIp(),
        protocol: ws._connectomeChannel.protocol,
        remotePubkeyHex: ws._connectomeChannel.remotePubkeyHex(),
        operational: ws._connectomeChannel.isReady({ warn: false }), // connected and agreed on shared key .. so far only used in informative cli `dmt connections` list, otherwise we never have to check for this in our distributed systems logic
        //informative-nature only, not used for distributed system logic
        readyState: ws.readyState, // underlying ws-connection original 'readyState' -- useful only for debugging purposes, otherwise it's just informative
        connectedAt: ws._connectomeChannel.connectedAt,
        lastMessageAt: ws._connectomeChannel.lastMessageAt
      });
    });

    return list;
  }

  periodicCleanupAndPing() {
    this.webSocketServer.clients.forEach(ws => {
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
