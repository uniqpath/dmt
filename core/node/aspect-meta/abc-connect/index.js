import fs from 'fs';

import { log, abcVersion as _abcVersion, isRPi, abcSocket } from 'dmt/common';
import connect from './lib/connect';
import _initConnection from './lib/initConnection';
import startABC from './lib/startABC';

import { push } from 'dmt/notify';

const abcVersion = _abcVersion();

let client;

const CONNECT_RETRY_DELAY = 1000;

function initConnection({ ipcClient, program }) {
  client = ipcClient;

  _initConnection({ ipcClient, program });

  ipcClient.on('/init_response', payload => {
    log.gray(`ABC v${payload.abcVersion} (uptime: ${payload.uptime})`);
    if (payload.abcVersion != abcVersion) {
      log.gray(`dmt-proc was started when ABC was at version v${abcVersion}`);
    }
  });

  ipcClient.on('close', () => {
    client = null;

    log.yellow('Lost connection to ABC process ...');
    setTimeout(() => tryConnect({ program }), CONNECT_RETRY_DELAY);
  });
}

function tryConnect({ once = false, counter = 1, program } = {}) {
  return new Promise((success, reject) => {
    connect(abcSocket)
      .then(ipcClient => {
        initConnection({ ipcClient, program });
        log.cyan('✓ Connected to 🔦 ABC process');
        success();
      })
      .catch(e => {
        if (counter == 10 || counter % 50 == 0) {
          const msg = counter == 10 ? '😔 Cannot connect to ABC process' : `⚠️😔 Still cannot connect to ABC process (${counter} retries)`;
          push.notify(msg);

          if (counter == 10 || counter == 50 || counter % 500 == 0) {
            log.red(msg);
            log.gray(e);
          }
        }

        if (once) {
          reject(e);
        } else {
          setTimeout(() => {
            tryConnect({ counter: counter + 1, program })
              .then(success)
              .catch(reject);
          }, CONNECT_RETRY_DELAY);
        }
      });
  });
}

function tryStartABC(program) {
  startABC()
    .then(() => {
      log.magenta('Started 🔦ABC, trying to connect ...');
      setTimeout(() => tryConnect({ program }), CONNECT_RETRY_DELAY);
    })
    .catch(e => {
      const msg = '⚠️  Error starting ABC process';
      push.notify(msg);
      log.red(msg);
      log.gray(e);
    });
}

function startAndConnectToABC(program) {
  if (fs.existsSync(abcSocket)) {
    tryConnect({ once: true, program }).catch(() => {
      log.gray('Failed to connect to ABC process, (re)starting ABC ...');
      tryStartABC(program);
    });
  } else {
    tryStartABC(program);
  }
}

function setupDmtToAbcBridge(program) {
  program.on('send_abc', ({ message, context }) => {
    if (client) {
      client.emit('/dmt_message', { message, context });
    }
  });
}

function init(program) {
  setupDmtToAbcBridge(program);

  const tick = isRPi() ? 'slowtick' : 'tick';

  program.on(tick, () => {
    program.sendABC({ message: program.network.name(), context: 'set_network' });
  });

  program.on('ready', () => {
    startAndConnectToABC(program);
  });
}

export { init, startABC };
