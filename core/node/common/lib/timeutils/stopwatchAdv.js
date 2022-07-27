import prettyMicroDuration from './prettyMicroDuration/index.js';
import formatMilliseconds from './formatMilliseconds.js';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);

  const prettyTime = duration < 1e9 ? prettyMicroDuration(duration) : formatMilliseconds(duration / 1e6);

  return { duration, prettyTime };
}

export default { start, stop };
