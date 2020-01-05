const fs = require('fs');
const path = require('path');
const dmt = require('dmt-bridge');
const { push } = require('dmt-notify');

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

const daemon = require('./daemonize2/lib/daemonize').setup({
  main: `${proc}`,
  name: `${procName}`,
  pidfile: pidFilePath,
  nodeFlags: ['--experimental-modules']
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
