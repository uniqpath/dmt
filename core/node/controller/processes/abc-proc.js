import fs from 'fs';

import { log, scan, abcSocket, device } from 'dmt/common';

import { push } from 'dmt/notify';

push.initABC();

import setupGlobalErrorHandler from './abc/setupGlobalErrorHandler';
import abcProc from './abc/proc';

const deviceName = device({ onlyBasicParsing: true }).id;

const logfile = 'abc.log';
log.init({ deviceName, logfile, foreground: false, procTag: 'abc' });

setupGlobalErrorHandler();

if (fs.existsSync(log.logfilePath)) {
  const currentLog = scan.readFileLines(log.logfilePath).filter(line => line.trim() != '');
  if (currentLog.length > 0) {
    const lastLine = currentLog[currentLog.length - 1];
    if (lastLine.includes('EXITING ABC, bye')) {
      push.notify('⚠️☠️ ABC process crashed on previous run');
    }
  }
}

if (fs.existsSync(abcSocket)) {
  fs.unlinkSync(abcSocket);
  setTimeout(abcProc, 2000);
} else {
  abcProc();
}
