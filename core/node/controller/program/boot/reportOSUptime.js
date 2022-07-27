import os from 'os';

import { log, colors, timeutils } from 'dmt/common';

const { convertSeconds } = timeutils;

export default function osUptime() {
  const uptime = os.uptime();

  const more = uptime < 60 ? colors.gray(`(${Math.round(uptime)}s)`) : '';

  const sec = convertSeconds(uptime);

  const txt = uptime < 60 ? colors.magenta(sec) : colors.gray(sec);

  const msg = `OS uptime: ${txt} ${more}`.trim();

  log.cyan(msg);
}
