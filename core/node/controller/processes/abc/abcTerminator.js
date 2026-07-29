import fs from 'fs';

import { log, abcVersion, timeutils, abcSocket, isDevUser, isMainDevice, colors } from 'dmt/common';

const { prettyTimeAgo, ONE_MINUTE, ONE_DAY } = timeutils;

import { push, desktop } from 'dmt/notify';

import { startABC } from 'dmt/abc-connect';

const initialAbcVersion = abcVersion();

const TICK_INTERVAL = 800;

export default function abcTerminator(ser, startedAt) {
  function restartABC() {
    ser.close();
    setTimeout(() => {
      startABC();
      process.exit();
    }, 200);
  }

  const checker = () => {
    const uptime = prettyTimeAgo(startedAt).replace(' ago', '');

    const _abcVersion = abcVersion({ allowCrash: false });
    if (initialAbcVersion != _abcVersion) {
      const msg = `abc-proc is restarting because of version change: v${initialAbcVersion} → v${_abcVersion} (uptime was ${uptime})`;
      log.magenta(msg);

      restartABC();

      if (isDevUser()) {
        if (isMainDevice()) {
          desktop.notify(msg).then(() => {
            restartABC();
          });
        } else {
          restartABC();
        }
      } else {
        restartABC();
      }
    } else if (!fs.existsSync(abcSocket)) {
      log.yellow(`Terminating because socket ${colors.gray(abcSocket)} was deleted (uptime was ${uptime})`);
      log.gray('Another abc-proc is most likely just starting and we can only have one running at the same time');
      process.exit();
    } else {
      setTimeout(checker, TICK_INTERVAL);
    }
  };

  checker();
}
