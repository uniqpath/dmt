import fs from 'fs';
import dmt from 'dmt/common';

import connect from './lib/connect';
import _initConnection from './lib/initConnection';
import startABC from './lib/startABC';

import { push } from 'dmt/notify';

const device = dmt.device({ onlyBasicParsing: true });

const abcVersion = dmt.abcVersion();

const { log } = dmt;

let client;

function notify(msg) {
  push.notify(`🕵️‍♂️ ABC (🖥️${device.id}): ${msg}`);
}

const CONNECT_RETRY_DELAY = 2000;

function initConnection(ipcClient) {
  client = ipcClient;

  _initConnection(ipcClient);

  ipcClient.on('/init_response', payload => {
    log.gray(`ABC v${payload.abcVersion} (uptime: ${payload.uptime})`);
    if (payload.abcVersion != abcVersion) {
      log.gray(`dmt-proc was started when ABC was at version v${abcVersion}`);
    }
  });

  ipcClient.on('close', () => {
    client = null;

    log.yellow('Lost connection to ABC process ...');
    setTimeout(tryConnect, CONNECT_RETRY_DELAY);
  });
}

function tryConnect({ once = false, counter = 1 } = {}) {
  return new Promise((success, reject) => {
    connect(dmt.abcSocket)
      .then(ipcClient => {
        log.cyan('✓ Connected to 🕵️‍♂️  ABC process');
        initConnection(ipcClient);
        success();
      })
      .catch(e => {
        if (counter % 10 == 0) {
          const msg = `⚠️  Could not connect to abc-proc in ${counter} retries!`;
          notify(msg);
          log.red(msg);
          log.gray(e);
        }

        if (once) {
          reject(e);
        } else {
          setTimeout(() => {
            tryConnect({ counter: counter + 1 })
              .then(success)
              .catch(reject);
          }, CONNECT_RETRY_DELAY);
        }
      });
  });
}

function tryStartABC() {
  startABC()
    .then(() => {
      log.magenta('Started 🕵️‍♂️  ABC, trying to connect to it...');
      setTimeout(tryConnect, CONNECT_RETRY_DELAY);
    })
    .catch(e => {
      const msg = '⚠️  Error starting abc-proc';
      notify(msg);
      log.red(msg);
      log.gray(e);
    });
}

function startAndConnectToABC() {
  if (fs.existsSync(dmt.abcSocket)) {
    tryConnect({ once: true }).catch(() => {
      log.gray('Failed to connect to ABC process, (re)starting ABC ...');
      tryStartABC();
    });
  } else {
    tryStartABC();
  }
}

function setupDmtToAbcBridge(program) {
  program.on('send_abc', message => {
    if (client) {
      client.emit('/dmt_message', { message });
    }
  });
}

function init(program) {
  setupDmtToAbcBridge(program);

  program.on('ready', () => {
    startAndConnectToABC();
  });
}

export { init, startABC };
