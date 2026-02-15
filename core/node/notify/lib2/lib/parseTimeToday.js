import validateTime from './validateTime.js';
import splitTime from './splitTime.js';

export default function parseTimeToday({ time, tag, now = new Date() }) {
  validateTime(time, tag);

  const { h, m } = splitTime(time);

  const d = new Date(now.getTime());
  d.setHours(h);
  d.setMinutes(m);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}
