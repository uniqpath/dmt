function timedConsoleLog(msg) {
  console.log(`${new Date().toLocaleString()} → ${msg}`);
}

function doLogging(color, log, ...args) {
  if (typeof log == 'function') {
    timedConsoleLog(...args);
  } else if (log) {
    log.logOutput(color, { source: 'connectome' }, ...args);
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
