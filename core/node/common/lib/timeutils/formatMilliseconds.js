import util from '../util.js';
import { round } from '../formatNumber/formatNumber.js';

function getMinutesAndSeconds(timeMs) {
  const _seconds = Math.round(timeMs / 1000);
  const minutes = Math.floor(_seconds / 60);
  const seconds = _seconds % 60;

  return { minutes, seconds };
}

function formatMinutesAndSeconds(timeMs, { omitSeconds = false } = {}) {
  const { minutes, seconds } = getMinutesAndSeconds(timeMs);

  let result = '';

  if (minutes != 0) {
    result += `${minutes} min`;
  }

  if (seconds != 0 && !omitSeconds) {
    result += ` ${round(seconds, 0)}${minutes == 0 ? '' : ' '}s`;
  }

  return result.trim();
}

export default function formatMilliseconds(timeMs) {
  if (timeMs < 1000) {
    return `${util.pad(round(timeMs, 1), 2)}ms`;
  }

  const _seconds = Math.round(timeMs / 1000);

  if (_seconds < 60) {
    return `${round(timeMs / 1000, 1)}s`;
  }

  if (_seconds < 60 * 60) {
    return formatMinutesAndSeconds(timeMs, { omitSeconds: _seconds >= 30 * 60 });
  }

  const _hours = Math.floor(_seconds / 3600);
  const seconds = _seconds % 3600;

  const _days = Math.floor(_hours / 24);
  const hours = _hours % 24;

  const weeks = Math.floor(_days / 7);
  const days = _days % 7;

  const prepend = [];

  if (weeks) {
    prepend.push(`${weeks} w`);
  }

  if (days) {
    prepend.push(`${days} d`);
  }

  if (hours) {
    prepend.push(`${hours} h`);
  }

  return `${prepend.join(' ')} ${formatMinutesAndSeconds(seconds * 1000, { omitSeconds: true })}`.trim();
}
