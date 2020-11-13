import prettyMicroDuration from './prettyMicroDuration';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return { duration, prettyTime: prettyMicroDuration(duration) };
}

export default { start, stop };
