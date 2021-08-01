import WebSocket from 'ws';

import _establishAndMaintainConnection from './establishAndMaintainConnection.js';

function establishAndMaintainConnection(opts) {
  opts.log = opts.log || console.log;
  return _establishAndMaintainConnection(opts, { WebSocket });
}

export default establishAndMaintainConnection;
