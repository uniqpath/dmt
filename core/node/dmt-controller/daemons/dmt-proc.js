const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const program = require('../program/program.js');

const logfile = 'dmt.log';
log.init({ logfile });

if (process.argv.length > 2 && process.argv[2] == '--fg') {
  log.cyan(`⚠️  ${colors.magenta('dmt-proc')} running in ${colors.magenta('foreground')}.`);
}

const mids = [];
mids.push('user');
mids.push('player');
mids.push('search');
mids.push('connections/lanbus');
mids.push('connections/nearby');
mids.push('iot/iot');

mids.push({ gui: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });

mids.push('content/samba');
mids.push('meta/bash-exec');
mids.push('meta/replicate');

mids.push('meta/sysinfo');

try {
  program({ mids });
} catch (e) {
  log.cyan('⚠️ ⚠️ ⚠️  GENERAL ERROR:');
  log.red(e.toString());
  log.gray(e);
}
