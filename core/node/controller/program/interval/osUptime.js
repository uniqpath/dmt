import os from 'os';

import { log, colors, timeutils } from 'dmt/common';

const { convertSeconds } = timeutils;

let firstRun = true;

export default function osUptime(program) {
  const uptime = os.uptime();
  const age = convertSeconds(uptime)
    .replace('about', '')
    .replace('less than a minute', 'a few seconds')
    .trim();
  program.slot('device').update({ osUptime: uptime < 60 ? `${Math.round(uptime)} seconds` : age }, { announce: false });

  if (firstRun) {
    const more = uptime < 60 ? colors.gray(`(${Math.round(uptime)}s)`) : '';
    const txt = uptime < 60 ? colors.magenta(age) : colors.gray(age);
    const msg = `OS uptime: ${txt} ${more}`.trim();
    log.cyan(msg);
    firstRun = false;
  }
}
