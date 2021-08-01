import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

import { Worker, isMainThread, parentPort } from 'worker_threads';

import { colors, deviceDefFile, dmtPath, debugMode, prettyFileSize } from './dmtPreHelper.js';
import scan from './scan.js';

import colorJSON from './colorJSON.js';
import ScreenOutput from './loggerScreenOutput.js';

import formatMilliseconds from './timeutils/formatMilliseconds.js';

const LIMIT = 15000;

const MAX_LINE_LENGTH = 5000;

const BUFFER_LIMIT = 200;

const LOGROTATE_CHECKPOINT = 1000;

function getAllFuncs(obj) {
  return Object.getOwnPropertyNames(obj.prototype).filter(prop => prop != 'constructor' && typeof obj.prototype[prop] == 'function');
}

function includeModule(obj, Module) {
  const module = new Module();
  for (const func of getAllFuncs(Module)) {
    obj[func] = module[func].bind(obj);
  }
}

function getSymbol(source) {
  if (source == 'connectome') {
    return colors.cyan('⧦');
  }

  return '∞';
}

class Logger {
  constructor() {
    this.buffer = [];
    this.linesWrittenCount = 0;

    this.REPORT_LINES = 50;

    includeModule(this, ScreenOutput);
  }

  initCallback(entryLoggedCallback) {
    this.entryLoggedCallback = entryLoggedCallback;
  }

  bufferLines(lines = LIMIT) {
    return this.buffer.slice(-lines);
  }

  init({ deviceName, logfile, foreground, profiling, procTag }) {
    this.foreground = !!foreground;
    this.profiling = !!profiling;

    if (logfile) {
      this.logfilePath = path.join(dmtPath, `log/${logfile}`);
    }

    this.procTag = procTag;

    const filePath = deviceDefFile();

    if (!fs.existsSync(filePath)) {
      const defMissingMsg = `⚠️  Cannot read ${colors.cyan('device.def')} file  device`;
      const msg = `${defMissingMsg} — make sure device is selected - use ${colors.green('dmt device select')} to select device`;
      this.red(msg);
      process.exit();
    }

    try {
      this.deviceName = deviceName;
    } catch (e) {
      this.red(e);
      process.exit();
    }
  }

  isForeground() {
    return this.foreground;
  }

  isProfiling() {
    return this.profiling;
  }

  fwrite(msg) {
    if (this.linesWrittenCount % LOGROTATE_CHECKPOINT === 0) {
      this.linesWrittenCount = 1;
      if (fs.existsSync(this.logfilePath)) {
        const fileSize = fs.statSync(this.logfilePath).size;

        try {
          const currentLog = scan.readFileLines(this.logfilePath);

          if (currentLog.length > LIMIT) {
            if (fileSize > 100000000) {
              this.logOutput('yellow', {}, `⚠️  Warning: log file size reached ${prettyFileSize(fileSize)} before trimming`);
            }

            fs.writeFileSync(this.logfilePath, currentLog.slice(-LIMIT).join(os.EOL));
          }
        } catch (e) {
          if (e.code == 'ERR_STRING_TOO_LONG') {
            const msg = `${e.code}: Discarding entire persisted log, file size is too big to read (${prettyFileSize(
              fileSize
            )}). This should not happen normally.`;
            fs.unlinkSync(this.logfilePath);
            this.logOutput('red', {}, msg);
          } else {
            throw e;
          }
        }
      }
    } else {
      this.linesWrittenCount += 1;
    }

    fs.writeFileSync(this.logfilePath, `${msg}${os.EOL}`, { flag: 'a' });
  }

  lineMetadata({ error }) {
    const meta = {
      deviceName: this.deviceName,
      pid: process.pid,
      time: new Date().toLocaleString(),
      timestamp: Date.now()
    };

    if (error) {
      meta.error = true;
    }

    return meta;
  }

  wireWorker(worker) {
    worker.on('message', msg => {
      if (typeof msg === 'object' && !Array.isArray(msg) && msg?.type == '__log') {
        const { color, options, args } = msg.payload;
        this.logOutput(color, options, ...args);
      }
    });
  }

  logOutput(color, options = {}, ...args) {
    if (!isMainThread) {
      const payload = { color, options, args };
      parentPort.postMessage({ type: '__log', payload });
      return;
    }

    const { onlyToFile = false, skipMeta = false, error = false, source } = options;

    let colorFn;

    if (!color) {
      colorFn = colors.white;
    } else if (typeof color == 'string') {
      if (color == 'white') {
        colorFn = colors.bold().white;
      } else {
        colorFn = colors[color];
      }
    } else {
      throw new Error('cannot pass color function anymore to logger, use color name as string');
    }

    const meta = this.lineMetadata({ error });

    let rawMsg = util.format(...args);

    let trimmedMark = '';

    if (rawMsg.length > MAX_LINE_LENGTH) {
      const RESET_COLOR = '\x1B[0m';
      rawMsg = rawMsg.slice(0, MAX_LINE_LENGTH).trim() + `${RESET_COLOR} ${colors.gray('…')}`;
      trimmedMark = colors.bold().white('[trimmed] ');
    }

    let msg = colorFn(rawMsg);

    if (!skipMeta) {
      const { deviceName, pid, time } = meta;

      let pidStr = pid;
      let timeStr = time;

      let diffStr = '';

      if (this.buffer.length > 0) {
        const prev = this.buffer[this.buffer.length - 1];
        const diff = meta.timestamp - prev.meta.timestamp;

        diffStr = ` (+${formatMilliseconds(diff)})`;

        if (diff > 1000) {
          diffStr = colors.blue().bold(diffStr);
        } else if (diff >= 100) {
          diffStr = colors.white(diffStr);
        }
      } else {
        pidStr = colors.magenta(pid);
        timeStr = colors.bold().white(time);
      }

      let foregroundMark = '';

      if (this.foreground == true) {
        foregroundMark = colors.gray('[run] ');
        if (this.profiling == true) {
          foregroundMark += colors.cyan('[profiling] ');
        }
      } else if (this.foreground == false) {
        foregroundMark = '';
      }

      const symbol = rawMsg.trim() == '' ? '' : getSymbol(source);

      msg = `${foregroundMark}${colors.cyan(this.procTag ? `${this.procTag} ` : '')}${!this.procTag && !deviceName ? colors.cyan('Proc') : ''}${
        deviceName ? `${colors.blue().bold(deviceName)}` : ''
      } ${pidStr} ${colors.gray(timeStr)}${colors.gray(diffStr)} ${symbol} ${trimmedMark}${msg}`.trim();
    }

    if (!onlyToFile) {
      console.log(msg);
    }

    const logentry = { msg, meta };

    this.buffer.push(logentry);

    if (this.entryLoggedCallback) {
      this.entryLoggedCallback(logentry);
    }

    for (let i = 0; i < this.buffer.length - BUFFER_LIMIT; i++) {
      this.buffer.shift();
    }

    if (this.logfilePath) {
      this.fwrite(msg);
    }
  }

  dir(obj) {
    if (obj) {
      const cj = colorJSON(obj);
      this.logOutput(undefined, { skipMeta: true }, cj);
    }
  }

  debug(title, { obj = null, cat = null } = {}) {
    if (debugMode(cat)) {
      console.log();
      const debugMarker = colors.cyan('🔧 DEBUG:');
      console.log(debugMarker);

      const commonOpts = { debug: true, debugCat: cat };

      if (title) {
        this.logOutput('yellow', commonOpts, title);
      }

      if (obj) {
        this.logOutput('gray', Object.assign(commonOpts, { onlyToFile: true }), obj);
        console.log(colorJSON(obj));
      }
    }
  }
}

export default Logger;
