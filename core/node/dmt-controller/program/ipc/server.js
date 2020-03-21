import dmt from 'dmt-bridge';
const { log } = dmt;

import path from 'path';
import { homedir } from 'os';

import ipc from 'node-ipc';

ipc.config.id = 'server';
ipc.config.appspace = 'ipc.dmt.';
ipc.config.socketRoot = path.join(homedir(), '.dmt/state/');
ipc.config.retry = 1500;
ipc.config.silent = true;

function serve(program) {
  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      try {
        const { storeName, action, payload } = JSON.parse(data);

        if (storeName == 'gui') {
          program.emit('send_to_connected_guis', { action, payload });
        } else {
          log.red(`Cannot process IPC request: ${data}`);
        }

        ipc.server.emit(socket, 'ack', 'empty');
      } catch (e) {
        log.red(e);
      }
    });
  });

  ipc.server.start();
}

export default serve;
