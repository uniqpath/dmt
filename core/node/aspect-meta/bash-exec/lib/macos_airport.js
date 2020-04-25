import fs from 'fs';

import dmt from 'dmt/bridge';
const { textfileParsers } = dmt;
const { textfileKeyValueParser } = textfileParsers;

import { exec } from 'child_process';

const executable = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';

const bashAction = `${executable} -I`;

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

      const content = stdout || '';

      const keys = 'BSSID';
      const keyMap = { BSSID: 'bssid' };
      const result = textfileKeyValueParser({ content, keys, keyMap, delimiter: ':' });
      success(result);
    });
  });
};
