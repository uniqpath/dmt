import fs from 'fs';
import path from 'path';

import daemonize from './daemonize2/lib/daemonize';

import { push } from 'dmt/notify';

import { fileURLToPath } from 'url';

import { dmtPath, nodeFlags, device } from 'dmt/common';

const __filename = fileURLToPath(import.meta.url);

function usage() {
  console.log('Usage: daemon [start|stop] [script.js]');
}

const args = process.argv.slice(2);

if (args.length < 2) {
  usage();
  process.exit();
}

const proc = args[1];
const procName = proc.replace(new RegExp(/\.js$/, ''), '');

if (!fs.existsSync(`${proc}`)) {
  console.log(`Missing ${proc} file`);
  usage();
  process.exit();
}

const pidFilePath = path.join(dmtPath, `log/${procName}.pid`);

function removeStalePidFile() {
  if (fs.existsSync(pidFilePath)) {
    fs.unlinkSync(pidFilePath);
  }
}

const daemon = daemonize({
  filename: __filename,
  main: `${proc}`,
  name: `${procName}`,
  pidfile: pidFilePath,
  nodeFlags
});

function restart({ notifyOnFail = false } = {}) {
  let triedStart;
  let didKill;

  daemon.on('stopped', () => {
    if (!didKill) {
      if (!triedStart) {
        triedStart = true;
        daemon.start();
      } else if (notifyOnFail) {
        push
          .highPriority()
          .notify(`Failed to (re)start process on ${device().id} (check log)`)
          .then(() => {
            process.exit();
          });
      }
    }
  });

  daemon.on('notrunning', () => {
    if (!didKill) {
      triedStart = true;
      daemon.start();
    }
  });

  daemon.stop();
}

switch (args[0]) {
  case 'start':
    removeStalePidFile();
    daemon.start();
    break;

  case 'stop':
    daemon.stop();
    break;

  case 'restart':
    restart();
    break;

  case 'restart_and_notify_on_fail':
    restart({ notifyOnFail: true });
    break;

  default:
    usage();
}
