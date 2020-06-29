import { log } from '../utils/index.js';
import _establishAndMaintainConnection from './establishAndMaintainConnection.js';

function establishAndMaintainConnection(opts) {
  return new Promise(success => {
    success(_establishAndMaintainConnection(opts, { WebSocket, log }));
  });
}

export default establishAndMaintainConnection;
