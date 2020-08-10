const browser = typeof window !== 'undefined';

const wsCONNECTING = 0;
const wsOPEN = 1;
const wsCLOSING = 2;
const wsCLOSED = 3;

import Connector from '../connector/connector.js';

function establishAndMaintainConnection(
  { address, ssl = false, port, protocol, protocolLane, rpcRequestTimeout, clientPrivateKey, clientPublicKey, remotePubkey, verbose },
  { WebSocket, log }
) {
  const wsProtocol = ssl ? 'wss' : 'ws';
  const endpoint = port.toString().startsWith('/') ? `${wsProtocol}://${address}${port}` : `${wsProtocol}://${address}:${port}`;

  log(`Trying to connect to ws endpoint ${endpoint} ...`);

  const connector = new Connector({ address, protocolLane, rpcRequestTimeout, clientPrivateKey, clientPublicKey, verbose });

  if (connector.connection) {
    return connector;
  }

  connector.connection = {
    terminate() {
      this.websocket._removeAllCallbacks();
      this.websocket.close();
      connector.connectStatus(false);
    },
    endpoint,
    checkTicker: 0
  };

  setTimeout(() => tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }), 10);

  const connectionCheckInterval = 1500;
  const callback = () => {
    if (!connector.decommissioned) {
      checkConnection({ connector, endpoint, protocol }, { WebSocket, log });
      setTimeout(callback, connectionCheckInterval);
    }
  };

  setTimeout(callback, connectionCheckInterval);

  return connector;
}

export default establishAndMaintainConnection;

function checkConnection({ connector, endpoint, protocol }, { WebSocket, log }) {
  const conn = connector.connection;

  if (connectionIdle(conn) || connector.decommissioned) {
    if (connectionIdle(conn)) {
      log(`Connection ${connector.connection.endpoint} became idle, closing websocket ${conn.websocket.rand}`);
    } else {
      log(`Connection ${connector.connection.endpoint} decommisioned, closing websocket ${conn.websocket.rand}, will not retry again `);
    }

    conn.terminate();
    return;
  }

  const connected = socketConnected(conn);
  if (connected) {
    conn.websocket.send('ping');
  } else {
    if (connector.connected == undefined) {
      log(`Setting connector status to FALSE because connector.connected is undefined`);
      connector.connectStatus(false);
    }

    tryReconnect({ connector, endpoint, protocol }, { WebSocket, log });
  }

  conn.checkTicker += 1;
}

function tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }) {
  const conn = connector.connection;

  if (conn.currentlyTryingWS && conn.currentlyTryingWS.readyState == wsCONNECTING) {
    if (conn.currentlyTryingWS._waitForConnectCounter == 3) {
      conn.currentlyTryingWS._removeAllCallbacks();
      conn.currentlyTryingWS.close();
    } else {
      conn.currentlyTryingWS._waitForConnectCounter += 1;
      return;
    }
  }

  const ws = new WebSocket(endpoint, protocol);

  conn.currentlyTryingWS = ws;
  conn.currentlyTryingWS._waitForConnectCounter = 0;

  ws.rand = Math.random();

  log(`Created new WebSocket ${ws.rand} for endpoint ${endpoint}`);

  if (browser) {
    ws.binaryType = 'arraybuffer';
  }

  if (!browser) {
    ws.on('error', error => {});
  }

  const openCallback = m => {
    log(`websocket ${ws.rand} conn to ${endpoint} open`);
    conn.currentlyTryingWS = null;
    conn.checkTicker = 0;
    addSocketListeners({ ws, connector, openCallback }, { log });
    conn.websocket = ws;
    connector.connectStatus(true);
  };

  ws._removeAllCallbacks = () => {
    ws.removeEventListener('open', openCallback);
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
    log(`websocket ${ws.rand} conn ${connector.connection.endpoint} error`);
    log(m);
  };

  const closeCallback = m => {
    log(`websocket ${ws.rand} conn ${connector.connection.endpoint} closed`);
    connector.connectStatus(false);
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
      const encryptedData = browser ? new Uint8Array(msg) : msg;
      connector.wireReceive({ encryptedData });
    }
  };

  ws._removeAllCallbacks = () => {
    ws.removeEventListener('error', errorCallback);
    ws.removeEventListener('close', closeCallback);
    ws.removeEventListener('message', messageCallback);

    ws.removeEventListener('open', openCallback);
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
}

function socketConnected(conn) {
  return conn.websocket && conn.websocket.readyState == wsOPEN;
}

function connectionIdle(conn) {
  return socketConnected(conn) && conn.checkTicker > 5;
}
