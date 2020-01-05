const colors = require('colors');

class ScreenOutput {
  write(...args) {
    this.white(...args);
  }

  white(...args) {
    this.logOutput(colors.white, {}, ...args);
  }

  green(...args) {
    this.logOutput(colors.green, {}, ...args);
  }

  yellow(...args) {
    this.logOutput(colors.yellow, {}, ...args);
  }

  red(...args) {
    this.logOutput(colors.red, {}, ...args);
  }

  error(...args) {
    this.logOutput(colors.red, { error: true }, ...args);
  }

  cyan(...args) {
    this.logOutput(colors.cyan, {}, ...args);
  }

  magenta(...args) {
    this.logOutput(colors.magenta, {}, ...args);
  }

  gray(...args) {
    this.logOutput(colors.gray, {}, ...args);
  }
}

module.exports = ScreenOutput;
