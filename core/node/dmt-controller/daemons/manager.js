import fs from 'fs';
import path from 'path';
import dmt from 'dmt-bridge';

import daemonize from './daemonize2/lib/daemonize';

import { push } from 'dmt-notify';

import { fileURLToPath } from 'url';

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

const pidFilePath = path.join(dmt.dmtPath, `log/${procName}.pid`);

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
  nodeFlags: ['--experimental-modules', '--experimental-specifier-resolution=node']
});

function restart({ notifyOnFail = false } = {}) {
  let shouldTryAgain = true;
  daemon.on('stopped', () => {
    if (shouldTryAgain) {
      shouldTryAgain = false;
      daemon.start();
    } else if (notifyOnFail) {
      push.notify(`Failed to (re)start process on ${dmt.device().id} (check log)`, () => {
        process.exit();
      });
    }
  });
  daemon.on('notrunning', () => {
    shouldTryAgain = false;
    daemon.start();
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
