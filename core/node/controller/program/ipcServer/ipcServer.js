import dmt from 'dmt/bridge';
const { log, parseCliArgs } = dmt;

import path from 'path';
import { homedir } from 'os';

import ipc from 'node-ipc';

ipc.config.id = 'server';
ipc.config.appspace = 'ipc.dmt.';
ipc.config.socketRoot = path.join(homedir(), '.dmt/state/');
ipc.config.retry = 1500;
ipc.config.silent = true;

function emitResponse({ response, socket }) {
  ipc.server.emit(socket, 'ack', response);
}

function emitError({ error, socket }) {
  log.red('IPC server error:');
  log.red(error);
  ipc.server.emit(socket, 'ack', { error: error.message });
}

function server(program) {
  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      try {
        const { actorName, storeName, action, payload, atDevice } = JSON.parse(data);

        if (storeName == 'gui') {
          program.emit('send_to_connected_guis', { action, payload });

          ipc.server.emit(socket, 'ack', 'empty');
        } else if (actorName) {
          if (atDevice) {
            const device = parseCliArgs(atDevice).atDevices[0];
            let { address, port, hostType, host } = device;
            if (hostType == 'dmt') {
              const nearbyIp = dmt.getLocalIpViaNearby({ program, deviceName: host });
              if (nearbyIp) {
                address = nearbyIp;
                port = null;
              }
            }

            program.fiberPool
              .getConnector(address, port || 7780)
              .then(connector => {
                connector
                  .remoteObject(actorName)
                  .call(action, payload)
                  .then(response => emitResponse({ response, socket }))
                  .catch(error => emitError({ error, socket }));
              })
              .catch(error => emitError({ error, socket }));
          } else {
            program
              .actor(actorName)
              .call(action, payload)
              .then(response => emitResponse({ response, socket }))
              .catch(error => emitError({ error, socket }));
          }
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
