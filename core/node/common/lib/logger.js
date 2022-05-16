import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

import { colors, deviceDefFile, dmtPath, debugMode } from './dmtPreHelper';
import scan from './scan';

import colorJSON from './colorJSON';
import ScreenOutput from './loggerScreenOutput';

import formatDuration from './timeutils/formatDuration';

const LIMIT = 20000;
const FIVE_MIN = 300000;

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
    if (this.linesWrittenCount % (LIMIT / 10) === 0) {
      if (fs.existsSync(this.logfilePath)) {
        const currentLog = scan.readFileLines(this.logfilePath);
        if (currentLog.length > LIMIT) {
          fs.writeFileSync(this.logfilePath, currentLog.slice(-LIMIT).join(os.EOL));
        }
      }

      this.linesWrittenCount = 0;
    }

    fs.writeFileSync(this.logfilePath, `${msg}\n`, { flag: 'a' });
    this.linesWrittenCount += 1;
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

  infoLine({ deviceName, pid, time }) {
    return `${deviceName ? `${colors.magenta(deviceName)}` : '[unknown deviceName, before log init]'} ${pid} ${colors.gray(time)}`;
  }

  logOutput(color, { onlyToFile = false, skipMeta = false, error = false, source } = {}, ...args) {
    const meta = this.lineMetadata({ error });

    const rawMsg = util.format(...args);

    let _color;

    if (!color) {
      _color = colors.white;
    } else if (typeof color == 'string') {
      if (color == 'white') {
        _color = colors.bold().white;
      } else {
        _color = colors[color];
      }
    } else {
      _color = color;
    }

    let msg = _color(rawMsg);

    if (!skipMeta) {
      const infoLine = this.infoLine(meta);

      let diffStr = '';

      if (this.buffer.length > 0) {
        const prev = this.buffer[this.buffer.length - 1];
        const diff = meta.timestamp - prev.meta.timestamp;

        diffStr = ` (+${formatDuration(diff)})`;

        if (diff > 1000) {
          diffStr = colors.white(diffStr);
        }
      }

      let foregroundMark = colors.gray('[?] ');

      if (this.foreground == true) {
        foregroundMark = colors.gray('[run] ');
        if (this.profiling == true) {
          foregroundMark += colors.cyan('[profiling] ');
        }
      } else if (this.foreground == false) {
        foregroundMark = '';
      }

      const symbol = rawMsg.trim() == '' ? '' : getSymbol(source);

      msg = `${foregroundMark}${this.procTag ? `${colors.cyan(this.procTag)} ` : ''}${infoLine}${colors.gray(diffStr)} ${symbol} ${msg}`;
    }

    if (!onlyToFile) {
      console.log(msg);
    }

    const logentry = { msg, meta };

    this.buffer.push(logentry);

    if (this.entryLoggedCallback) {
      this.entryLoggedCallback(logentry);
    }

    for (let i = 0; i < this.buffer.length - LIMIT; i++) {
      this.buffer.shift();
    }

    if (this.logfilePath) {
      this.fwrite(msg);
    }
  }

  dir(obj) {
    if (obj) {
      const cj = colorJSON(obj);
      this.logOutput(colors.white, { skipMeta: true }, cj);
    }
  }

  debug(title, { obj = null, cat = null } = {}) {
    if (debugMode(cat)) {
      console.log();
      const debugMarker = colors.cyan('🔧 DEBUG:');
      console.log(debugMarker);

      const commonOpts = { debug: true, debugCat: cat };

      if (title) {
        this.logOutput(colors.yellow, commonOpts, title);
      }

      if (obj) {
        this.logOutput(colors.gray, Object.assign(commonOpts, { onlyToFile: true }), obj);
        console.log(colorJSON(obj));
      }
    }
  }
}

export default Logger;
