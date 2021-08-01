import util from '../util';
import { round } from '../formatNumber/formatNumber';

function getMinutesAndSeconds(timeMs) {
  const _seconds = timeMs / 1000;
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
    result += ` ${round(seconds, 0)}s`;
  }

  return result.trim();
}

export default function formatDuration(timeMs) {
  if (timeMs <= 1000) {
    return `${util.pad(timeMs, 2)}ms`;
  }

  if (timeMs < 60 * 1000) {
    return `${round(timeMs / 1000, 1)}s`;
  }

  if (timeMs < 60 * 60 * 1000) {
    return formatMinutesAndSeconds(timeMs);
  }

  const _seconds = timeMs / 1000;
  const hours = Math.floor(_seconds / 3600);
  const seconds = _seconds % 3600;

  return `${hours} h ${formatMinutesAndSeconds(seconds * 1000)}`;
}
