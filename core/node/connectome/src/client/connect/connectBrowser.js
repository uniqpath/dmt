import { log } from '../../utils/index.js';
import _establishAndMaintainConnection from './establishAndMaintainConnection.js';

function establishAndMaintainConnection(opts) {
  return _establishAndMaintainConnection(opts, { WebSocket, log });
}

export default establishAndMaintainConnection;
