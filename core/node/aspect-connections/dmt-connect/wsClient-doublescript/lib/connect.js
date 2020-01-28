const browser = typeof window !== 'undefined';

function establishAndMaintainConnection({ obj, endpoint, resumeNow }, { WebSocket, log }) {
  if (resumeNow) {
    checkConnection({ obj, endpoint }, { WebSocket, log, resumeNow });
    return;
  }

  if (obj.connection) {
    return;
  }

  const conn = {
    send(data) {
      if (obj.isConnected()) {
        this.websocket.send(data);
      } else {
        log.write(`Warning: "${data}" was not sent because the store is not yet connected to the backend`);
      }
    },

    close() {
      this.closedManually = true;
      this.websocket.onclose = () => {};

      obj.connectStatus(false);
      this.websocket.close();
    }
  };

  obj.connection = conn;
  obj.connection.endpoint = endpoint;

  tryReconnect({ obj, endpoint }, { WebSocket, log });

  conn.checkTicker = 0;

  const connectionCheckInterval = 1000;
  const callback = () => {
    if (!obj.connection.closedManually) {
      checkConnection({ obj, endpoint }, { WebSocket, log });
      setTimeout(callback, connectionCheckInterval);
    }
  };

  setTimeout(callback, connectionCheckInterval);
}

export default establishAndMaintainConnection;

function checkConnection({ obj, endpoint }, { WebSocket, log, resumeNow }) {
  const conn = obj.connection;

  const connected = socketConnected(conn);

  if (connected) {
    conn.websocket.send('ping');
  } else if (!obj.reconnectPaused && (resumeNow || conn.checkTicker <= 30 || conn.checkTicker % 3 == 0)) {
    tryReconnect({ obj, endpoint }, { WebSocket, log });
  }

  obj.connectStatus(connected);

  conn.checkTicker += 1;
}

function tryReconnect({ obj, endpoint }, { WebSocket, log }) {
  if (obj.connection.closedManually) {
    return;
  }

  const conn = obj.connection;

  const ws = new WebSocket(endpoint);

  if (browser) {
    ws.binaryType = 'arraybuffer';
  }

  if (!browser) {
    ws.on('error', error => {});
  }

  const openCallback = m => {
    if (!obj.isConnected()) {
      log.write(`websocket conn to ${endpoint} open`);
      conn.checkTicker = 0;

      addSocketListeners({ ws, obj, openCallback }, { log });

      conn.websocket = ws;

      if (obj.freshConnection) {
        obj.freshConnection(ws);
      }

      obj.connectStatus(true);
    } else {
      ws.close();
    }
  };

  if (browser) {
    ws.addEventListener('open', openCallback);
  } else {
    ws.on('open', openCallback);
  }
}

function addSocketListeners({ ws, obj, openCallback }, { log }) {
  const conn = obj.connection;

  const errorCallback = m => {
    log.write(`websocket conn ${obj.connection.endpoint} error`);
    log.write(m);
  };

  const closeCallback = m => {
    obj.connectStatus(false);
    log.write(`websocket conn ${obj.connection.endpoint} closed`);
  };

  const messageCallback = _msg => {
    conn.checkTicker = 0;

    const msg = browser ? _msg.data : _msg;

    if (msg == 'pong') {
      return;
    }

    let jsonData;

    try {
      jsonData = JSON.parse(msg);
    } catch (e) {}

    if (jsonData) {
      obj.wireReceive({ jsonData });
    } else {
      obj.wireReceive({ binaryData: msg });
    }
  };

  if (browser) {
    ws.addEventListener('error', errorCallback);
    ws.addEventListener('close', closeCallback);
    ws.addEventListener('message', messageCallback);
  } else {
    ws.on('error', errorCallback);
    ws.on('close', closeCallback);
    ws.on('message', messageCallback);
  }

  const staleSocketCheckInterval = 1 * 1000;
  const purgeSocketIfStale = () => {
    if (!socketConnected(conn)) {
      ws.close();
    } else {
      setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
    }
  };
  setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
}

function socketConnected(conn) {
  const STATE_OPEN = 1;

  return !!(conn.websocket && conn.checkTicker <= 12 && conn.websocket.readyState == STATE_OPEN);
}
