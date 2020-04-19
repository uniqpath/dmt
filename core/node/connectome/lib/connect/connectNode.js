import WebSocket from 'ws';

import util from '../util';
import _establishAndMaintainConnection from './establishAndMaintainConnection';

const { log } = util;

function establishAndMaintainConnection(opts) {
  return new Promise(success => {
    success(_establishAndMaintainConnection(opts, { WebSocket, log }));
  });
}

export default establishAndMaintainConnection;
