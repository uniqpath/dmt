import prettyMicroTime from './prettyMicroTime';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return { duration, prettyTime: prettyMicroTime(duration) };
}

export default { start, stop };
