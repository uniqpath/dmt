const browser = typeof window !== 'undefined';

const wsCONNECTING = 0;
const wsOPEN = 1;
const wsCLOSING = 2;
const wsCLOSED = 3;

import Connector from '../connector/connector.js';
import determineEndpoint from './determineEndpoint.js';

import logger from '../../utils/logger/logger.js';

function establishAndMaintainConnection({ endpoint, host, port, protocol, keypair, remotePubkey, rpcRequestTimeout, log, verbose, tag, dummy }, { WebSocket }) {
  endpoint = determineEndpoint({ endpoint, host, port });

  const connector = new Connector({
    endpoint,
    protocol,
    rpcRequestTimeout,
    keypair,
    verbose,
    tag,
    log,
    dummy
  });

  connector.connection = {
    terminate() {
      this.websocket._removeAllCallbacks();
      this.websocket.close();
      connector.connectStatus(false);
    },
    endpoint,
    checkTicker: 0
  };

  setTimeout(() => tryReconnect({ connector, endpoint }, { WebSocket, log, verbose }), 10);

  const connectionCheckInterval = 1000;

  const callback = () => {
    if (!connector.decommissioned) {
      checkConnection({ connector, endpoint }, { WebSocket, log, verbose });
      setTimeout(callback, connectionCheckInterval);
    }
  };

  setTimeout(callback, connectionCheckInterval);

  return connector;
}

export default establishAndMaintainConnection;

function checkConnection({ connector, endpoint }, { WebSocket, log, verbose }) {
  const conn = connector.connection;

  if (connectionIdle(conn) || connector.decommissioned) {
    if (connectionIdle(conn)) {
      logger.yellow(log, `Connection ${connector.connection.endpoint} became idle, closing websocket ${conn.websocket.rand}`);
    } else {
      logger.yellow(log, `Connection ${connector.connection.endpoint} decommisioned, closing websocket ${conn.websocket.rand}, will not retry again `);
    }

    conn.terminate();
    return;
  }

  const connected = socketConnected(conn);

  if (connected) {
    conn.websocket.send('ping');
  } else {
    if (connector.connected == undefined) {
      logger.write(log, `Setting connector status to FALSE because connector.connected is undefined`);
      connector.connectStatus(false);
    }

    tryReconnect({ connector, endpoint }, { WebSocket, log, verbose });
  }

  conn.checkTicker += 1;
}

function tryReconnect({ connector, endpoint }, { WebSocket, log, verbose }) {
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

  const ws = new WebSocket(endpoint);
  conn.currentlyTryingWS = ws;
  conn.currentlyTryingWS._waitForConnectCounter = 0;

  ws.rand = Math.random();

  if (browser) {
    ws.binaryType = 'arraybuffer';
  }

  if (!browser) {
    ws.on('error', error => {});
  }

  const openCallback = m => {
    if (verbose) {
      logger.write(log, `websocket ${endpoint} connection opened (${ws.rand})`);
    }

    conn.currentlyTryingWS = null;
    conn.checkTicker = 0;
    addSocketListeners({ ws, connector, openCallback }, { log, verbose });
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

function addSocketListeners({ ws, connector, openCallback }, { log, verbose }) {
  const conn = connector.connection;

  const errorCallback = m => {
    logger.write(log, `websocket ${ws.rand} conn ${connector.connection.endpoint} error`);
    logger.write(log, m);
  };

  const closeCallback = m => {
    logger.write(log, `websocket ${connector.connection.endpoint} connection closed (${ws.rand})`);
    connector.connectStatus(false);
  };

  const messageCallback = _msg => {
    conn.checkTicker = 0;

    const msg = browser ? _msg.data : _msg;

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
  return socketConnected(conn) && conn.checkTicker > 2;
}
