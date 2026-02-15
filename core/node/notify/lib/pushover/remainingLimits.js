import stripAnsi from 'strip-ansi';

import { log, timeutils, colors } from 'dmt/common';

import { push } from 'dmt/notify';

const { prettyTimeAgo } = timeutils;

const WARN_BELOW1 = 500;
const WARN_BELOW2 = 100;

let alreadyWarned1 = false;
let alreadyWarned2 = false;

export default function checkRemainingLimits(app, client) {
  const rem = client.appRemaining;

  if ((!alreadyWarned1 && rem < WARN_BELOW1) || (!alreadyWarned2 && rem < WARN_BELOW2)) {
    if (rem < WARN_BELOW1) {
      alreadyWarned1 = true;
    }

    let critical;

    if (rem < WARN_BELOW2) {
      alreadyWarned2 = true;
      critical = true;
    }

    const icon = critical ? '❗' : '⚠️';
    const msg = `Pushover app [ ${colors.cyan(app)} ] remaining limit = ${colors.cyan(rem)} [ resets ${prettyTimeAgo(parseInt(client.appReset) * 1000)} ]`;

    push
      .highPriority(critical)
      .title(`${icon} Soon reaching pushover limit for [ ${app} ]`)
      .notify(stripAnsi(msg));
    log.magenta(`${icon} ${msg}`);
  }
}
