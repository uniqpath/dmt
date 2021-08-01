import prettyMicroDuration from './prettyMicroDuration/index.js';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return duration < 1e9 ? prettyMicroDuration(duration) : `${duration / 1e6}ms`;
}

export default { start, stop };
