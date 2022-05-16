import { device } from 'dmt/common';

import fs from 'fs';
import { exec } from 'child_process';

const { platform } = process;

function notify(msg, title = device().id) {
  msg = msg.replaceAll('"', '\\"');
  title = title.replaceAll('"', '\\"');

  return new Promise((success, reject) => {
    if (platform == 'darwin') {
      exec(`osascript -e 'display notification "${msg}" with title "${title}"'`, (err, stdout, stderr) => {
        success();
      });
    } else if (platform == 'linux' && fs.existsSync('/usr/bin/notify-send')) {
      exec(`/usr/bin/notify-send "${title}" "${msg}"`, (err, stdout, stderr) => {
        success();
      });
    } else {
      success();
    }
  });
}

export { notify };
