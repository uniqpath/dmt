import fs from 'fs';

import dmt from 'dmt/common';
const { log, scan } = dmt;

import { push } from 'dmt/notify';

push.initABC();

import setupGlobalErrorHandler from './abc/setupGlobalErrorHandler';
import abcProc from './abc/proc';

const logfile = 'abc.log';
log.init({ dmt, logfile, foreground: false, procTag: 'abc' });

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

if (fs.existsSync(dmt.abcSocket)) {
  fs.unlinkSync(dmt.abcSocket);
  setTimeout(abcProc, 2000);
} else {
  abcProc();
}
