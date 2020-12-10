import dmt from 'dmt/bridge';
const { log } = dmt;

import program from '../program/program';

let foreground;

if (process.argv.length > 2 && process.argv[2] == '--fg') {
  foreground = true;
}

const logfile = 'dmt.log';
log.init({ logfile, foreground });

const mids = [];

mids.push('user');
mids.push('player');
mids.push('search');
mids.push('identity');
mids.push('apps');

mids.push({ gui: { condition: deviceDef => deviceDef.try('service[gui].disable') != 'true' } });

mids.push('nearby/lanbus');
mids.push('nearby/nearby');
mids.push('iot');

mids.push('content/samba');
mids.push('meta/bash-exec');
mids.push('meta/replicate');
mids.push('meta/update');
mids.push('meta/holidays');

mids.push('meta/zeta-peers');

try {
  program({ mids });
} catch (e) {
  log.cyan('⚠️ ⚠️ ⚠️  GENERAL ERROR:');
  log.red(e.toString());
  log.gray(e);
}
