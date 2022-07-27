import { dateFns } from 'dmt/common';

const { subDays } = dateFns;

import validateTime from './validateTime.js';
import splitTime from './splitTime.js';

export default function parseTimeYesterday(time, tag) {
  validateTime(time, tag);

  const { h, m } = splitTime(time);

  const d = subDays(new Date(), 1);
  d.setHours(h);
  d.setMinutes(m);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}
