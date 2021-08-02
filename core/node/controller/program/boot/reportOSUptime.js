import os from 'os';
import dmt from 'dmt/common';

const { log } = dmt;

import colors from 'colors';

export default function osUptime() {
  const uptime = os.uptime();

  const more = uptime < 60 ? colors.gray(`(${uptime}s)`) : '';

  const msg = `OS uptime: ${colors.green(dmt.convertSeconds(uptime))} ${more}`.trim();

  log.cyan(msg);
}
