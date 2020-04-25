import fs from 'fs';
import dmt from 'dmt/bridge';
const { textfileParsers } = dmt;
const { textfileKeyValueParser } = textfileParsers;

import { exec } from 'child_process';

let executable = '/sbin/wpa_cli';

if (!fs.existsSync(executable)) {
  executable = '/bin/wpa_cli';
}

const bashAction = `${executable} -i wlan0 status`;

export default () => {
  return new Promise((success, reject) => {
    if (!fs.existsSync(executable)) {
      reject(new Error(`${executable} is missing`));
      return;
    }

    exec(bashAction, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const keys = 'bssid';
      const result = textfileKeyValueParser({ content: stdout, keys });
      success(result);
    });
  });
};
