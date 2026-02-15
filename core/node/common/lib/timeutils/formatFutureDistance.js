import { differenceInSeconds, differenceInMilliseconds, isBefore, formatDistanceToNowStrict, localeSL } from './dateFnsCompacted/index.js';

import formatMilliseconds from './formatMilliseconds.js';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

export default function formatFutureDistance(date, { referenceDate, lang = undefined } = {}) {
  const locale = lang == 'sl' ? localeSL : undefined;

  const now = referenceDate || new Date();

  if (isBefore(date, now)) {
    return `${differenceInSeconds(date, now)} s`;
  }

  const diffMs = differenceInMilliseconds(date, now);

  if (diffMs <= ONE_SECOND) {
    return lang == 'sl' ? 'Zdaj' : 'Now';
  }

  if (diffMs < ONE_MINUTE) {
    return `${Math.round(diffMs / ONE_SECOND)}s`;
  }

  if (diffMs < 5 * ONE_HOUR) {
    return formatMilliseconds(diffMs);
  }

  let distance = formatDistanceToNowStrict(date, { locale });

  if (lang == 'sl') {
    distance = distance
      .replace(/\b1 minuta/, '1 minuto')
      .replace(/\b1 ura/, '1 uro')
      .replace('meseci', 'mesece');
  }

  return distance;
}
