import colors from 'colors';
import prettyMicroDuration from './prettyMicroDuration';

function start() {
  return process.hrtime.bigint();
}

function stop(start) {
  const duration = Number(process.hrtime.bigint() - start);
  return prettyMicroDuration(duration);
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
