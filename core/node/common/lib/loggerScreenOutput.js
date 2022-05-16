import colors from './colors/colors';

class ScreenOutput {
  write(...args) {
    this.logOutput(colors.white, {}, ...args);
  }

  red(...args) {
    this.logOutput(colors.red, {}, ...args);
  }

  green(...args) {
    this.logOutput(colors.green, {}, ...args);
  }

  yellow(...args) {
    this.logOutput(colors.yellow, {}, ...args);
  }

  blue(...args) {
    this.logOutput(colors.blue, {}, ...args);
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

  white(...args) {
    this.logOutput(colors.bold().white, {}, ...args);
  }

  error(...args) {
    this.logOutput(colors.red, { error: true }, ...args);
  }
}

export default ScreenOutput;
