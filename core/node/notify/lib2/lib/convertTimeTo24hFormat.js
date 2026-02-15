import validateTime from './validateTime.js';
import splitTime from './splitTime.js';

export default function convertTimeTo24hFormat(time) {
  validateTime(time);

  const { h, m } = splitTime(time);

  return `${h}:${m.toString().padStart(2, '0')}`;
}
