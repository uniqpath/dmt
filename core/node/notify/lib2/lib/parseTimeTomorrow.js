import { dateFns } from 'dmt/common';

const { addDays } = dateFns;

import validateTime from './validateTime.js';
import splitTime from './splitTime.js';

export default function parseTimeTomorrow({ time, tag, now = new Date() }) {
  validateTime(time, tag);

  const { h, m } = splitTime(time);

  const d = addDays(now, 1);
  d.setHours(h);
  d.setMinutes(m);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}
