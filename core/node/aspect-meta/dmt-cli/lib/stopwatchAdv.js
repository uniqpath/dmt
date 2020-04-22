import prettyTime from './prettyTime';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return { duration, prettyTime: prettyTime(duration) };
}

export default { start, stop };
