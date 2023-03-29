import { log, device, isDevUser } from 'dmt/common';

import program from '../program/program.js';
import exceptionNotify from '../program/exceptionNotify.js';
import exit from '../program/exit.js';
import getExitMsg from '../program/getExitMsg.js';

let foreground;
let profiling;
let fromABC;

const args = process.argv.slice(2);

if (args.length > 0 && args[0] == '--fg') {
  foreground = true;

  if (args.length > 1 && args[1] == '--profile') {
    profiling = true;
  }
}

if (args.length > 0 && args[0] == '--from_abc') {
  fromABC = true;
}

const deviceName = device({ onlyBasicParsing: true }).id;

const logfile = 'dmt.log';
log.init({ deviceName, foreground, profiling, logfile });

const mids = [];

mids.push('player');
mids.push('search');

mids.push('extend/user-engine-load');
mids.push({ 'extend/apps-load': { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });
mids.push({ 'extend/apps-serve': { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });
mids.push({ gui: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });
mids.push('nearby/lanbus');
mids.push('nearby/nearby');
mids.push('iot');

mids.push('content/samba');

mids.push('meta/abc-connect');

if (isDevUser()) {
  mids.push('meta/netping');
  mids.push('meta/connectivity-report');
}

mids.push('meta/replicate');
mids.push('meta/sysinfo');
mids.push('meta/holidays');

mids.push('webindex');
mids.push('webscan');

try {
  program({ mids, fromABC });
} catch (e) {
  const title = '⚠️  DMT BOOT ERROR ⚠️';

  log.red(title);
  log.red(e);

  exceptionNotify(getExitMsg(e)).then(() => {
    exit();
  });
}
