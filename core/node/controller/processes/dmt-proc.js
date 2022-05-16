import { log, device, isDevUser } from 'dmt/common';

import program from '../program/program';
import exceptionNotify from '../program/exceptionNotify';
import exit from '../program/exit';
import getExitMsg from '../program/getExitMsg';

let foreground;
let profiling;

if (process.argv.length > 2 && process.argv[2] == '--fg') {
  foreground = true;

  if (process.argv.length > 3 && process.argv[3] == '--profile') {
    profiling = true;
  }
}

const deviceName = device({ onlyBasicParsing: true }).id;

const logfile = 'dmt.log';
log.init({ deviceName, foreground, profiling, logfile });

const mids = [];

mids.push('meta/load-user-engine');
mids.push('player');
mids.push('search');
mids.push('notify');
mids.push('meta/load-app-engines');

mids.push({ gui: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });
mids.push({ frontend: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });

mids.push('nearby/lanbus');
mids.push('nearby/nearby');
mids.push('iot');

mids.push('content/samba');

mids.push('meta/abc-connect');

mids.push('meta/netping');
mids.push('meta/bash-exec');
mids.push('meta/replicate');
mids.push('meta/sysinfo');
mids.push('meta/holidays');

mids.push('webindex');
mids.push('webscan');

try {
  program({ mids });
} catch (e) {
  const title = '⚠️  DMT BOOT ERROR ⚠️';

  log.red(title);
  log.red(e);

  exceptionNotify(getExitMsg(e)).then(() => {
    exit();
  });
}
