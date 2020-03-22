const browser = typeof window !== 'undefined';

import Connector from './connector';

function establishAndMaintainConnection(
  { obj, endpoint, protocol, protocolLane, clientPrivateKey, clientPublicKey, remotePubkey, resumeNow, verbose },
  { WebSocket, log }
) {
  const connector = obj || new Connector({ protocolLane, clientPrivateKey, clientPublicKey, verbose });

  if (resumeNow) {
    checkConnection({ connector, endpoint, protocol }, { WebSocket, log, resumeNow });
    return connector;
  }

  if (connector.connection) {
    return connector;
  }

  connector.connection = {};
  connector.connection.endpoint = endpoint;

  setTimeout(() => tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }), 10);

  connector.connection.checkTicker = 0;

  const connectionCheckInterval = 1000;
  const callback = () => {
    if (!connector.connection.closedManually) {
      checkConnection({ connector, endpoint, protocol }, { WebSocket, log });
      setTimeout(callback, connectionCheckInterval);
    }
  };

  setTimeout(callback, connectionCheckInterval);

  return connector;
}

export default establishAndMaintainConnection;

function checkConnection({ connector, endpoint, protocol }, { WebSocket, log, resumeNow }) {
  const conn = connector.connection;

  if (connectionIdle(conn)) {
    conn.websocket.close();
    return;
  }

  const connected = socketConnected(conn);
  if (connected) {
    conn.websocket.send('ping');
  } else if (!connector.reconnectPaused && (resumeNow || conn.checkTicker <= 30 || conn.checkTicker % 3 == 0)) {
    if (connector.connected == undefined) {
      connector.connectStatus(false);
    }

    tryReconnect({ connector, endpoint, protocol }, { WebSocket, log });
  }

  conn.checkTicker += 1;
}

function tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }) {
  if (connector.connection.closedManually) {
    return;
  }

  const conn = connector.connection;

  const ws = new WebSocket(endpoint, protocol);

  if (browser) {
    ws.binaryType = 'arraybuffer';
  }

  if (!browser) {
    ws.on('error', error => {});
  }

  const openCallback = m => {
    if (!connector.isConnected()) {
      log(`websocket conn to ${endpoint} open`);
      conn.checkTicker = 0;

      addSocketListeners({ ws, connector, openCallback }, { log });

      conn.websocket = ws;

      connector.connectStatus(true);
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

function addSocketListeners({ ws, connector, openCallback }, { log }) {
  const conn = connector.connection;

  const errorCallback = m => {
    log(`websocket conn ${connector.connection.endpoint} error`);
    log(m);
  };

  const closeCallback = m => {
    if (connector.isConnected()) {
      connector.connectStatus(false);
    }
    log(`websocket conn ${connector.connection.endpoint} closed`);
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
      connector.wireReceive({ jsonData, rawMessage: msg });
    } else {
      if (browser) {
        connector.wireReceive({ encryptedData: new Uint8Array(msg) });
      } else {
        connector.wireReceive({ encryptedData: msg });
      }
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

function connectionIdle(conn) {
  const STATE_OPEN = 1;

  return conn.websocket && conn.checkTicker > 12 && conn.websocket.readyState == STATE_OPEN;
}

function socketConnected(conn) {
  const STATE_OPEN = 1;
  return conn.websocket && conn.websocket.readyState == STATE_OPEN;
}
