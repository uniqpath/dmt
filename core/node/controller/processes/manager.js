import fs from 'fs';
import path from 'path';

import daemonize from './daemonize2/lib/daemonize.js';

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

let argsForDmtProc;
if (args.length > 2 && args[2] == '--from_abc') {
  argsForDmtProc = args[2];
}

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
  argv: [argsForDmtProc],
  nodeFlags
});

function restart({ notifyOnFail = false } = {}) {
  let triedStart;
  let didKill;
  let wasUnresponsive;

  daemon.on('stopped', () => {
    if (wasUnresponsive) {
      return;
    }

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
    if (wasUnresponsive) {
      return;
    }

    if (!didKill) {
      triedStart = true;
      daemon.start();
    }
  });

  daemon.stop();

  setTimeout(() => {
    if (!triedStart) {
      console.log('Killing the process because it is unresponsive, we let abc-proc restart it');
      wasUnresponsive = true;
      daemon.kill();
    }
  }, 10000);
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
