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

function server(program) {
  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      try {
        const { actorName, storeName, action, payload } = JSON.parse(data);

        if (storeName == 'gui') {
          program.emit('send_to_connected_guis', { action, payload });

          ipc.server.emit(socket, 'ack', 'empty');
        } else if (actorName) {
          program
            .actor(actorName)
            .call(action, payload)
            .then(response => {
              ipc.server.emit(socket, 'ack', response);
            })
            .catch(error => {
              log.red('IPC server error:');
              log.red(error);
              ipc.server.emit(socket, 'ack', { error: `ERROR PASSED TO IPC SERVER: ${error.message}` });
            });
        } else {
          log.red(`Cannot process IPC request: ${data}`);
        }
      } catch (e) {
        log.red(e);
      }
    });
  });

  ipc.server.start();
}

export default server;
