import { device, log, isDevMachine } from 'dmt/common';

import path from 'path';
import os from 'os';
import fs from 'fs';

const { platform } = process;

import notifier from './node-notifier/index.js';

function notify(message, title = device().id) {
  return new Promise((success, reject) => {
    if (platform != 'linux' || (platform == 'linux' && fs.existsSync('/usr/bin/notify-send'))) {
      notifier.notify(
        {
          title,
          message,
          contentImage: path.join(os.homedir(), '.dmt/etc/img/dmt.png')
        },
        (err, response, metadata) => {
          if (err) {
            log.red(`Error with desktop notification ${title} // ${message}:`);
            log.red(err);
            log.cyan(response);
            log.green(metadata);
          } else {
          }
        }
      );

      setTimeout(success, 100);
    } else {
      success();
    }
  });
}

export { notify };
