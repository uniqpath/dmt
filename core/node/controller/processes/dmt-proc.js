import dmt from 'dmt/common';
const { log } = dmt;

import program from '../program/program';

let foreground;

if (process.argv.length > 2 && process.argv[2] == '--fg') {
  foreground = true;
}

const logfile = 'dmt.log';
log.init({ dmt, foreground, logfile });

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

mids.push('meta/bash-exec');
mids.push('meta/replicate');
mids.push('meta/sysinfo');
mids.push('meta/holidays');

mids.push('webindex');
mids.push('webscan');

try {
  program({ mids });
} catch (e) {
  log.magenta('⚠️  GENERAL ERROR ⚠️');
  log.red(e);
}
