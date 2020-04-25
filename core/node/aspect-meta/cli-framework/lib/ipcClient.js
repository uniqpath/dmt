import ipc from 'node-ipc';

import path from 'path';
import { homedir } from 'os';

ipc.config.id = 'client';
ipc.config.appspace = 'ipc.dmt.';
ipc.config.socketRoot = path.join(homedir(), '.dmt/state/');
ipc.config.retry = 1500;
ipc.config.maxRetries = 1;
ipc.config.silent = true;

function call(request) {
  return new Promise((success, reject) => {
    ipc.connectTo('server', () => {
      ipc.of.server.on('connect', () => {
        ipc.of.server.emit('message', JSON.stringify(request));
      });

      ipc.of.server.on('disconnect', () => {
        reject(new Error('DISCONNECTED: Is dmt-proc running?'));
        ipc.log('disconnected from world'.notice);
      });

      ipc.of.server.on('ack', response => {
        success(response);
      });
    });
  });
}

export default call;
