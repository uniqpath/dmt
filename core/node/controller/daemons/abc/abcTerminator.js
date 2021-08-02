import fs from 'fs';

import dmt from 'dmt/common';
const { log } = dmt;

import { startABC } from 'dmt/abc-connect';

const initialAbcVersion = dmt.abcVersion();

const TICK_INTERVAL = 800;

export default function abcTerminator(ser, startedAt, notify) {
  function restartABC() {
    ser.close();

    startABC();
    process.exit();
  }

  const checker = () => {
    const uptime = dmt.prettyTimeAge(startedAt).replace(' ago', '');

    const abcVersion = dmt.abcVersion();
    if (initialAbcVersion != abcVersion) {
      const msg = `abc-proc is restarting because running version v${initialAbcVersion} is older than current version v${abcVersion} (uptime was ${uptime})`;
      log.magenta(msg);
      notify(msg).then(restartABC);
    } else if (!fs.existsSync(dmt.abcSocket)) {
      log.yellow(`current abc-proc is terminating because socket file was deleted (uptime was ${uptime})`);
      log.gray('another abc-proc is most likely just starting and we can only have one running at the same time');
      process.exit();
    } else {
      setTimeout(checker, TICK_INTERVAL);
    }
  };

  checker();
}
