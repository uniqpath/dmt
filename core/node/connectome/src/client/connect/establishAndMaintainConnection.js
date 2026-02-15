const browser = typeof window !== 'undefined';

const wsCONNECTING = 0;
const wsOPEN = 1;
const CONN_CHECK_INTERVAL = 1000;

const CONN_IDLE_TICKS = 3;

const WAIT_FOR_NEW_CONN_TICKS = 5;

import Connector from '../connector/connector.js';
import determineEndpoint from './determineEndpoint.js';

import logger from '../../utils/logger/logger.js';

function addListener(event, callback, ws) {
  if (browser) {
    ws.addEventListener(event, callback);
  } else {
    ws.on(event, callback);
  }
}

function removeListener(event, callback, ws) {
  if (browser) {
    ws.removeEventListener(event, callback);
  } else {
    ws.off(event, callback);
  }
}

function establishAndMaintainConnection(
  { endpoint, host, port, protocol, keypair, remotePubkey, rpcRequestTimeout, autoDecommission, log, verbose, tag, dummy },
  { WebSocket }
) {
  endpoint = determineEndpoint({ endpoint, host, port });

  const connector = new Connector({
    endpoint,
    protocol,
    rpcRequestTimeout,
    keypair,
    verbose,
    tag,
    log,
    autoDecommission,
    dummy
  });

  const reconnect = () => {
    tryReconnect({ connector, endpoint }, { WebSocket, reconnect, log, verbose });
  };

  connector.connection = {
    terminate() {
      this.websocket._removeAllCallbacks();
      this.websocket.__closed = true;
      this.websocket.close();
      connector.connectStatus(false);
      reconnect();
    },
    isOpen() {
      return this.websocket.readyState == wsOPEN && !this.websocket.__closed;
    },
    endpoint,
    checkTicker: 0
  };

  const callback = () => {
    if (!connector.decommissioned) {
      checkConnection({ connector, reconnect, log });
      setTimeout(callback, CONN_CHECK_INTERVAL);
    }
  };

  setTimeout(callback, 10);

  return connector;
}

export default establishAndMaintainConnection;

function checkConnection({ connector, reconnect, log }) {
  const conn = connector.connection;

  if (connectionIdle(conn) || connector.decommissioned) {
    if (connector.decommissioned) {
      logger.yellow(log, `${connector.endpoint} Connection decommisioned, closing websocket #${conn.websocket.__id}, will not retry again `);

      decommission(connector);
    } else {
      connector.emit('inactive_connection');
      logger.yellow(log, `${connector.endpoint} ✖ Terminated inactive connection #${conn.websocket.__id}`);
    }

    conn.terminate();
    return;
  }

  const connected = socketConnected(conn);

  if (connected) {
    conn.websocket.send('ping');
  } else {
    if (connector.connected == undefined) {
      logger.write(log, `${connector.endpoint} Setting connector status to FALSE because connector.connected is undefined`);
      connector.connectStatus(false);
    }

    reconnect();
  }

  conn.checkTicker += 1;
}

function tryReconnect({ connector, endpoint }, { WebSocket, reconnect, log, verbose }) {
  const conn = connector.connection;

  connector.checkForDecommission();

  if (connector.decommissioned) {
    decommission(connector);
    return;
  }

  const wsId = Math.round(10 ** 5 * Math.random()).toString();

  if (conn.currentlyTryingWS && conn.currentlyTryingWS.readyState == wsCONNECTING) {
    if (conn.currentlyTryingWS._waitForConnectCounter < WAIT_FOR_NEW_CONN_TICKS) {
      conn.currentlyTryingWS._waitForConnectCounter += 1;
      return;
    }

    if (verbose || browser) {
      logger.write(log, `${endpoint} Reconnect timeout, creating new ws`);
    }

    conn.currentlyTryingWS._removeAllCallbacks();
    conn.currentlyTryingWS.__closed = true;
    conn.currentlyTryingWS.close();
  } else if (verbose || browser) {
    logger.write(log, `${endpoint} Created new websocket #${wsId}`);
  }

  const ws = new WebSocket(endpoint);
  ws.__id = wsId;

  conn.currentlyTryingWS = ws;
  conn.currentlyTryingWS._waitForConnectCounter = 0;

  if (browser) {
    ws.binaryType = 'arraybuffer';
  }

  if (!browser) {
    ws.on('error', () => {});
  }

  const openCallback = () => {
    if (connector.decommissioned) {
      return;
    }

    if (verbose || browser) {
      logger.write(log, `${endpoint} Websocket #${wsId} open`);
    }

    conn.currentlyTryingWS = null;
    conn.checkTicker = 0;

    addSocketListeners({ ws, connector, openCallback, reconnect }, { log, verbose });
    conn.websocket = ws;

    connector.connectStatus(true);
  };

  ws._removeAllCallbacks = () => {
    removeListener('open', openCallback, ws);
  };

  addListener('open', openCallback, ws);
}

function addSocketListeners({ ws, connector, openCallback, reconnect }, { log, verbose }) {
  const conn = connector.connection;

  const errorCallback = event => {
    const msg = `${connector.endpoint} Websocket error`;
    console.log(msg);
    console.log(event);
  };

  const closeCallback = () => {
    ws.__closed = true;

    logger.blue(log, `${connector.endpoint} ✖ Connection #${ws.__id} [ ${connector.protocol} ] closed`);

    if (connector.decommissioned) {
      connector.connectStatus(false);
      return;
    }

    connector.connectStatus(undefined);

    reconnect();
  };

  const messageCallback = _msg => {
    if (connector.decommissioned) {
      return;
    }

    conn.checkTicker = 0;

    const msg = browser ? _msg.data : _msg;

    if (ws.__closed) {
      return;
    }

    if (msg == 'pong') {
      connector.emit('pong');
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
    removeListener('error', errorCallback, ws);
    removeListener('close', closeCallback, ws);
    removeListener('message', messageCallback, ws);
    removeListener('open', openCallback, ws);
  };

  addListener('error', errorCallback, ws);
  addListener('close', closeCallback, ws);
  addListener('message', messageCallback, ws);
}

function decommission(connector) {
  const conn = connector.connection;

  if (conn.currentlyTryingWS) {
    conn.currentlyTryingWS._removeAllCallbacks();
    conn.currentlyTryingWS.__closed = true;
    conn.currentlyTryingWS.close();
    conn.currentlyTryingWS = null;
  }

  if (conn.websocket) {
    conn.websocket._removeAllCallbacks();
    conn.websocket.__closed = true;
    conn.websocket.close();
    conn.websocket = null;
  }

  connector.connectStatus(false);
}

function socketConnected(conn) {
  return conn.websocket && conn.websocket.readyState == wsOPEN && !conn.websocket.__closed;
}

function connectionIdle(conn) {
  return socketConnected(conn) && conn.checkTicker > CONN_IDLE_TICKS;
}
