import fs from 'fs';

import { log, abcVersion as _abcVersion, isRPi, abcSocket, isDevUser, colors } from 'dmt/common';
import connect from './lib/connect.js';
import _initConnection from './lib/initConnection.js';
import startABC from './lib/startABC.js';
import { push, desktop } from 'dmt/notify';

const abcVersion = _abcVersion();

let client;

const CONNECT_RETRY_DELAY = 1000;

const CONNECT_TIMEOUT = 1500;
const CONNECT_PROBLEMS_RETRY_COUNTER_NOTIFY = 15;

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

    log.magenta('⚠️  Lost connection to ABC process ...');
    setTimeout(() => tryConnect({ program }), CONNECT_RETRY_DELAY);
  });
}

function tryConnect({ once = false, counter = 1, program } = {}) {
  return new Promise((success, reject) => {
    const timeout = CONNECT_TIMEOUT;

    connect(abcSocket, { timeout })
      .then(ipcClient => {
        initConnection({ ipcClient, program });
        log.green('✓✓ Connected to ABC process');
        success();
      })
      .catch(e => {
        if (
          counter == CONNECT_PROBLEMS_RETRY_COUNTER_NOTIFY ||
          counter == 2 * CONNECT_PROBLEMS_RETRY_COUNTER_NOTIFY ||
          counter % (20 * CONNECT_PROBLEMS_RETRY_COUNTER_NOTIFY) == 0
        ) {
          const msg =
            counter == CONNECT_PROBLEMS_RETRY_COUNTER_NOTIFY
              ? '😔 Cannot connect to ABC process'
              : `⚠️😔 Still cannot connect to ABC process (${counter} retries)`;

          push.notify(msg);
          desktop.notify(msg);

          log.red(msg);
          log.gray(e);
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
      log.green(`✓ Started ABC process, ${colors.cyan('trying to connect')} ...`);
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
    tryConnect({ once: true, program }).catch(e => {
      log.magenta('Could not connect to ABC process, re/starting ABC ...');
      if (isDevUser()) {
        log.gray(e);
      }
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

  program.on('gui:reload', () => {
    program.sendABC({ message: 'gui_reload' });
  });

  program.on('ready', () => {
    startAndConnectToABC(program);
  });
}

export { init, startABC };
