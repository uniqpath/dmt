import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

import program from '../program/program';

const logfile = 'dmt.log';
log.init({ logfile });

if (process.argv.length > 2 && process.argv[2] == '--fg') {
  log.cyan(`⚠️  ${colors.magenta('dmt-proc')} running in ${colors.magenta('foreground')}.`);
}

const mids = [];

mids.push('user');
mids.push('player');
mids.push('search');
mids.push('apps');

mids.push({ gui: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });

mids.push('nearby/lanbus');
mids.push('nearby/nearby');
mids.push('iot');

mids.push('content/samba');
mids.push('meta/bash-exec');
mids.push('meta/replicate');
//mids.push('meta/update');
mids.push('meta/holidays');

try {
  program({ mids });
} catch (e) {
  log.cyan('⚠️ ⚠️ ⚠️  GENERAL ERROR:');
  log.red(e.toString());
  log.gray(e);
}
