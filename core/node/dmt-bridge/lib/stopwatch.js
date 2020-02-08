import stopwatch from 'pretty-hrtime';

function start() {
  return process.hrtime();
}

function stop(start) {
  const end = process.hrtime(start);
  return stopwatch(end);
}

export default { start, stop };
