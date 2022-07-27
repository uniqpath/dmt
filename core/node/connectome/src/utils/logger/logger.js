import inspect from 'browser-util-inspect';

function doLogging(color, log, ...args) {
  try {
    if (log == console.log) {
      log(
        `${new Date().toLocaleString()} → ${inspect(...args)
          .replace(/^'/, '')
          .replace(/'$/, '')}`
      );
    } else if (typeof log == 'function') {
      log(...args);
    } else if (log) {
      log.logOutput(color, { source: 'connectome' }, ...args);
    }
  } catch (e) {
    console.log(e);
  }
}

class Logger {
  write(log, ...args) {
    doLogging(undefined, log, ...args);
  }

  red(log, ...args) {
    doLogging('red', log, ...args);
  }

  green(log, ...args) {
    doLogging('green', log, ...args);
  }

  yellow(log, ...args) {
    doLogging('yellow', log, ...args);
  }

  blue(log, ...args) {
    doLogging('blue', log, ...args);
  }

  cyan(log, ...args) {
    doLogging('cyan', log, ...args);
  }

  magenta(log, ...args) {
    doLogging('magenta', log, ...args);
  }

  gray(log, ...args) {
    doLogging('gray', log, ...args);
  }

  white(log, ...args) {
    doLogging('white', log, ...args);
  }
}

export default new Logger();
