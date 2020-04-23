import WebSocket from 'ws';

import { log } from '../utils';
import _establishAndMaintainConnection from './establishAndMaintainConnection';

function establishAndMaintainConnection(opts) {
  return new Promise(success => {
    success(_establishAndMaintainConnection(opts, { WebSocket, log }));
  });
}

export default establishAndMaintainConnection;
