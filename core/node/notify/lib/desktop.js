import { device, log, isDevMachine } from 'dmt/common';

import { push } from 'dmt/notify';

import fs from 'fs';
import { exec } from 'child_process';

const { platform } = process;

function escapeOsaScriptString(str) {
  return str
    .toString()
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"');
}

function notify(msg, title = device().id) {
  msg = escapeOsaScriptString(msg);
  title = escapeOsaScriptString(title);

  return new Promise((success, reject) => {
    if (platform == 'darwin') {
      exec(`osascript -e 'display notification "${msg}" with title "${title}"'`, (err, stdout, stderr) => {
        if (stdout || stderr || err) {
          log.red(`osascript "${msg}" with title "${title}" execution issue:`);
          if (isDevMachine()) {
            push.notify('osascript execution issue, check log');
          }
        }

        if (stdout) {
          log.red('stdout');
          log.gray(stdout);
        }

        if (stderr) {
          log.red('stderr');
          log.gray(stderr);
        }

        if (err) {
          log.red('error');
          log.yellow(err);
        }

        success();
      });
    } else if (platform == 'linux' && fs.existsSync('/usr/bin/notify-send')) {
      exec(`/usr/bin/notify-send "${title}" "${msg}"`, (err, stdout, stderr) => {
        if (err) {
          log.red('/usr/bin/notify-send error');
          log.yellow(err);
        }

        success();
      });
    } else {
      success();
    }
  });
}

export { notify };
