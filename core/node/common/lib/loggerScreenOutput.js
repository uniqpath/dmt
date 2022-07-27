class ScreenOutput {
  write(...args) {
    this.logOutput(undefined, {}, ...args);
  }

  red(...args) {
    this.logOutput('red', {}, ...args);
  }

  green(...args) {
    this.logOutput('green', {}, ...args);
  }

  yellow(...args) {
    this.logOutput('yellow', {}, ...args);
  }

  blue(...args) {
    this.logOutput('blue', {}, ...args);
  }

  cyan(...args) {
    this.logOutput('cyan', {}, ...args);
  }

  magenta(...args) {
    this.logOutput('magenta', {}, ...args);
  }

  gray(...args) {
    this.logOutput('gray', {}, ...args);
  }

  white(...args) {
    this.logOutput('white', {}, ...args);
  }

  error(...args) {
    this.logOutput('red', { error: true }, ...args);
  }
}

export default ScreenOutput;
