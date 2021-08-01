import WebSocket from 'ws';

import { log } from '../../utils/index.js';
import _establishAndMaintainConnection from './establishAndMaintainConnection.js';

function establishAndMaintainConnection(opts) {
  return _establishAndMaintainConnection(opts, { WebSocket, log: opts.log || log });
}

export default establishAndMaintainConnection;
