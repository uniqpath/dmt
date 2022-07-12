import { log, parseCliArgs, getLocalIpViaNearby } from 'dmt/common';

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

function emitError({ error, socket, program }) {
  const errorMsg = error?.message || 'Missing error message (rejected without an Error object)';

  log.red('IPC server error:');
  log.red(error || errorMsg);

  program.exceptionNotify(errorMsg, 'IPC server error');

  ipc.server.emit(socket, 'ack', { error: errorMsg });
}

function server(program) {
  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      try {
        const { actorName, namespace, action, payload, atDevice } = JSON.parse(data);

        if (namespace == 'gui') {
          program.emit('send_to_connected_guis', { action, payload });

          ipc.server.emit(socket, 'ack', 'empty');
        } else if (actorName) {
          if (atDevice) {
            const device = parseCliArgs(atDevice).atDevices[0];
            let { address, port, hostType, host } = device;
            if (hostType == 'dmt') {
              const nearbyIp = getLocalIpViaNearby({ program, deviceName: host });
              if (nearbyIp) {
                address = nearbyIp;
                port = null;
              }
            }

            program.fiberPool
              .getConnector({ address, port: port || 7780 })
              .then(connector => {
                if (connector.isReady()) {
                  connector
                    .remoteObject(actorName)
                    .call(action, payload)
                    .then(response => emitResponse({ response, socket }));
                } else {
                  emitError({ program, error: new Error('Connector was not ready in time, please retry the request.'), socket });
                }
              })
              .catch(error => emitError({ program, error, socket }));
          } else {
            program
              .actor(actorName)
              .call(action, payload)
              .then(response => emitResponse({ response, socket }))
              .catch(error => emitError({ program, error, socket }));
          }
        } else {
          log.red(`Cannot process IPC request: ${data}`);
        }
      } catch (error) {
        log.red('IPC Server Coding Error - should not happen');
        emitError({ program, error, socket });
      }
    });
  });

  ipc.server.start();
}

export default server;
