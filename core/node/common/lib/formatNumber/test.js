import dmtHelper from '../dmtHelper';

const { colors } = dmtHelper;

import { approx, round } from './formatNumber.js';

function assert(statement) {
  if (!statement) {
    throw new Error('fail');
  }
  console.log(colors.green('test ok'));
}

assert(approx(12000000) == '12m');
assert(approx(12400000) == '12.4m');
assert(approx(12600000000) == '12.6b');
assert(approx(2525000) == '2.53m');
assert(approx(252580) == '252.6k');

assert(approx(1000) == '1000');
assert(approx(100000) == '100k');

assert(approx(6546846546546654) == '6,547t');

assert(round(0.285) == 0.29);
assert(round(0.00589, 3) == 0.006);
assert(round(0.00589, 2) == 0.01);
assert(round(0.00589, 1) == 0.0);

assert(approx(0.45) == '0.45');
assert(approx(0.456575658) == '0.4566');
assert(approx(0.0456575658) == '0.045658');

assert(approx(0.456575658, { lowPrecision: true }) == '0.46');

assert(approx(9999.23456789) == '9999.2346');
assert(approx(9999.23456789, { lowPrecision: true }) == '9999.23');
assert(approx(10000.23456789) == '10k');

assert(approx(0.0) == '0');

console.log();
console.log(colors.green('✓ all tests passed'));
