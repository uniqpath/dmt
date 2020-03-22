import WebSocket from 'ws';

import util from '../util';
import _establishAndMaintainConnection from './establishAndMaintainConnection';

const { log } = util;

function establishAndMaintainConnection({ obj, endpoint, protocol, protocolLane, clientPrivateKey, clientPublicKey, resumeNow, verbose }) {
  return new Promise(success => {
    success(
      _establishAndMaintainConnection({ obj, endpoint, protocol, protocolLane, clientPrivateKey, clientPublicKey, resumeNow, verbose }, { WebSocket, log })
    );
  });
}

export default establishAndMaintainConnection;
