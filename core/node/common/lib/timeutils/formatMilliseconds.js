import util from '../util.js';
import { round } from '../formatNumber/formatNumber.js';

function getMinutesAndSeconds(timeMs) {
  const _seconds = Math.round(timeMs / 1000);
  const minutes = Math.floor(_seconds / 60);
  const seconds = _seconds % 60;

  return { minutes, seconds };
}

function formatMinutesAndSeconds(timeMs) {
  const { minutes, seconds } = getMinutesAndSeconds(timeMs);

  let result = '';

  if (minutes != 0) {
    result += `${minutes} min`;
  }

  if (seconds != 0) {
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
    return formatMinutesAndSeconds(timeMs);
  }

  const hours = Math.floor(_seconds / 3600);
  const seconds = _seconds % 3600;

  return `${hours} h ${formatMinutesAndSeconds(seconds * 1000)}`.trim();
}
