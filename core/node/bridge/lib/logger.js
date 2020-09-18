import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import colors from 'colors';

import dmt from './dmtHelper';
import dmtUtil from './util';
import scan from './scan';

import colorJSON from './colorJSON';
import ScreenOutput from './loggerScreenOutput';

const device = dmt.device({ onlyBasicParsing: true });

const LIMIT = 10000;

class Logger {
  constructor() {
    this.buffer = [];
    this.linesWrittenCount = 0;

    this.REPORT_LINES = 35;

    this.startTimestamp = Date.now();

    dmt.includeModule(this, ScreenOutput);
  }

  initCallback(entryLoggedCallback) {
    this.entryLoggedCallback = entryLoggedCallback;
  }

  bufferLines(lines = LIMIT) {
    return this.buffer.slice(-lines);
  }

  init({ logfile, foreground }) {
    this.logfile = logfile;
    this.isForeground = foreground;

    this.white(`${colors.cyan('dmt-proc')} running in terminal (foreground)`);
  }

  fwrite(msg) {
    const logfilePath = path.join(dmt.dmtPath, `log/${this.logfile}`);

    if (this.linesWrittenCount % (LIMIT / 10) === 0) {
      if (fs.existsSync(logfilePath)) {
        const currentLog = scan.readFileLines(logfilePath);
        if (currentLog.length > LIMIT) {
          fs.writeFileSync(logfilePath, currentLog.slice(-LIMIT).join(os.EOL));
        }
      }

      this.linesWrittenCount = 0;
    }

    fs.writeFileSync(logfilePath, `${msg}\n`, { flag: 'a' });
    this.linesWrittenCount += 1;
  }

  formatEpoch(epoch) {
    return `${colors.white(`${epoch}ms`)}`;
  }

  lineMetadata({ error }) {
    const meta = {
      deviceName: device.id,
      pid: process.pid,
      time: new Date().toLocaleString(),
      epoch: Date.now() - this.startTimestamp
    };

    if (error) {
      meta.error = true;
    }

    return meta;
  }

  infoLine(data) {
    return `${data.deviceName ? `${colors.magenta(data.deviceName)}` : ''} pid ${data.pid} ${colors.gray(data.time)} ${this.formatEpoch(data.epoch)}`;
  }

  logOutput(color, { onlyToFile = false, skipMeta = false, error = false } = {}, ...args) {
    const meta = this.lineMetadata({ error });

    let msg = color(util.format(...args));
    if (!skipMeta) {
      const infoLine = this.infoLine(meta);

      let diffStr = '';
      if (this.buffer.length > 0) {
        const prev = this.buffer[this.buffer.length - 1];
        const diff = meta.epoch - prev.meta.epoch;
        if (diff < 10000 && diff >= 0) {
          diffStr = colors.gray(` (+${dmtUtil.pad(diff, 2)}ms)`);
        }
      }

      msg = `${this.isForeground ? colors.red('✝ ') : ''}${infoLine}${diffStr} ∞ ${msg}`;
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

    if (this.logfile) {
      this.fwrite(msg.replace('✝', '[not daemonized]'));
    }
  }

  dir(obj) {
    if (obj) {
      const cj = colorJSON(obj);
      this.logOutput(colors.white, { skipMeta: true }, cj);
    }
  }

  dev(msg) {
    if (dmt.isDevMachine()) {
      this.logOutput(colors.yellow, {}, msg);
    }
  }

  debug(title, { obj = null, cat = null } = {}) {
    if (dmt.debugMode(cat)) {
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
