const stopwatch = require('pretty-hrtime');

function start() {
  return process.hrtime();
}

function stop(start) {
  const end = process.hrtime(start);
  return stopwatch(end);
}

module.exports = { start, stop };
