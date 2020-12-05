import prettyMicroDuration from './prettyMicroDuration/index.js';

const browser = typeof window !== 'undefined';

function start() {
  if (browser) {
    return;
  }

  return process.hrtime.bigint();
}

function stop(start) {
  if (browser) {
    return 'stopwatch not supported in browser (yet)';
  }

  const duration = Number(process.hrtime.bigint() - start);
  return prettyMicroDuration(duration);
}

export default { start, stop };
