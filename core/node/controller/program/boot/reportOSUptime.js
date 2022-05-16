import os from 'os';

import { log, colors, convertSeconds } from 'dmt/common';

export default function osUptime() {
  const uptime = os.uptime();

  const more = uptime < 60 ? colors.gray(`(${uptime}s)`) : '';

  const msg = `OS uptime: ${colors.gray(convertSeconds(uptime))} ${more}`.trim();

  log.cyan(msg);
}
