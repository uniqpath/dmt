import ipc from 'node-ipc';

import path from 'path';
import { homedir } from 'os';

ipc.config.id = 'client';
ipc.config.appspace = 'ipc.dmt.';
ipc.config.socketRoot = path.join(homedir(), '.dmt/state/');
ipc.config.retry = 1500;
ipc.config.maxRetries = 1;
ipc.config.silent = true;

function call({ storeName, action, payload }) {
  ipc.connectTo('server', () => {
    ipc.of.server.on('connect', () => {
      ipc.of.server.emit('message', JSON.stringify({ storeName, action, payload }));
    });

    ipc.of.server.on('disconnect', () => {
      ipc.log('disconnected from world'.notice);
    });

    ipc.of.server.on('ack', data => {
      process.exit();
    });
  });
}

export default call;
