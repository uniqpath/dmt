import { program, timeutils } from 'dmt/common';

const { formatFutureDistance } = timeutils;

import describeNearDate from './describeNearDate.js';
import localize from './localize.js';

export default function describeNearFuture(timepoint, daysBefore) {
  const { strIn } = localize(program);

  const inDays = `${strIn} ${formatFutureDistance(timepoint, { lang: program.lang() })}`;
  const strFuture = describeNearDate({ daysBefore, date: timepoint, inDays });

  return { strFuture, inDays };
}
