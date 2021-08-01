import xpipe from 'xpipe';
import net from 'net';

import EventEmitter from 'events';

const defaults = {
  server: {
    host: null,
    port: null,
    reconnect: 2000,
    encoding: 'utf8'
  },
  client: {
    host: null,
    port: null,
    reconnect: -1,
    timeout: 5000,
    encoding: 'utf8'
  }
};

function IPC() {
  let mediator;
  const separator = '<<<EOM\0';
  let sockets = [];
  let connectTimeout;

  let buffer;

  const write = (topic, data, socket, callback) => {
    if (typeof socket === 'function') {
      callback = socket;
      socket = undefined;
    }

    const _sockets = socket ? [socket] : sockets;

    try {
      const message = JSON.stringify({ topic, data }) + separator;
      _sockets.forEach(socket => socket.write(message));
      callback && callback();
    } catch (e) {
      if (callback) {
        callback(e);
      } else {
        mediator.emit('error', e);
      }
    }
  };

  const close = callback => {
    if (this.isServer) {
      this.opts.reconnect = -1;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      if (callback) this.server.on('close', callback);
      this.server.close();
    } else {
      clearTimeout(connectTimeout);
      sockets[0].destroy(callback);
    }
  };

  const onMessage = (message, socket) => {
    try {
      const incoming = JSON.parse(message);
      if (incoming && incoming.topic) {
        mediator.emit(incoming.topic, incoming.data, socket);
      } else {
        mediator.emit('error', new Error('Invalid data received.'));
      }
    } catch (e) {
      mediator.emit('error', e);
    }
  };

  const onData = (data, socket) => {
    if (buffer) {
      buffer += data;
    } else {
      buffer = data;
    }

    while (buffer.indexOf(separator) !== -1) {
      const message = buffer.substring(0, buffer.indexOf(separator));
      buffer = buffer.substring(buffer.indexOf(separator) + separator.length);
      if (message) {
        onMessage(message, socket);
      }
    }
  };
  const initializeMediator = () => {
    if (!mediator) mediator = new EventEmitter();
    mediator.on('error', e => {});
  };

  this.use = o => {
    mediator = new o();
  };

  this.on = (event, callback) => {
    mediator.on(event, callback);
    return this;
  };

  this.emit = (topic, data, socket, callback) => {
    write(topic, data, socket, callback);
    return this;
  };

  this.close = callback => {
    close(callback);
    return this;
  };

  this.listen = (options, callback) => {
    const server = net.createServer();
    const opts = { ...defaults.server, ...options };
    const connect = () => {
      if (opts.port) server.listen(opts.port, opts.host, callback);
      else server.listen(xpipe.eq(opts.path), callback);
    };

    this.isServer = true;
    this.opts = opts;
    this.server = server;

    initializeMediator();

    server.on('error', e => mediator.emit('error', e));

    server.on('connection', socket => {
      sockets.push(socket);
      mediator.emit('connect', socket);
      socket.setEncoding(opts.encoding);
      socket.on('data', data => onData(data, socket));
      socket.on('close', () => {
        mediator.emit('disconnect', socket);
        sockets.splice(sockets.indexOf(socket), 1);
      });
    });

    server.on('close', () => {
      if (opts.reconnect > 0) setTimeout(() => connect(server.listen), opts.reconnect);
      else mediator.emit('close');
    });

    connect();

    return this;
  };

  this.connect = (options, callback) => {
    const socket = new net.Socket();
    const opts = { ...defaults.client, ...options };
    let flagConnected;
    const connected = () => {
      flagConnected = true;
      callback && callback();
    };

    const connect = first => {
      flagConnected = false;
      if (opts.port) socket.connect(opts.port, opts.host, first ? connected : undefined);
      else socket.connect(xpipe.eq(opts.path), first ? connected : undefined);
      connectTimeout = setTimeout(() => {
        if (!flagConnected) {
          socket.destroy();
          if (opts.reconnect === -1) {
            callback(new Error('Connection timeout'));
          }
        }
      }, opts.timeout);
    };

    this.isServer = false;
    this.opts = opts;
    sockets = [socket];

    initializeMediator();

    socket.setEncoding(opts.encoding);

    socket.on('error', e => {
      mediator.emit('error', e);
    });

    socket.on('data', data => onData(data, socket));

    socket.on('close', () => {
      if (opts.reconnect > 0) setTimeout(() => connect(), opts.reconnect);
      else mediator.emit('close');
    });

    connect(true);

    return this;
  };

  return this;
}

export default IPC;
