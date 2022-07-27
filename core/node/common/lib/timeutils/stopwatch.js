import colors from '../colors/colors.js';
import prettyMicroDuration from './prettyMicroDuration/index.js';
import formatMilliseconds from './formatMilliseconds.js';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return duration < 1e9 ? prettyMicroDuration(duration) : formatMilliseconds(duration / 1e6);
}

function measureHelper(func, { desc = ' ', disable = false } = {}) {
  if (disable) {
    return func();
  }

  const start = start();
  const result = func();
  const duration = stop(start);
  const line = colors.gray(`Measured ${colors.cyan(desc)} -`);
  console.log(`${line} ${colors.green(duration)}`);

  return result;
}

export default { start, stop, measureHelper };
