export { default as prettyMicroDuration } from './prettyMicroDuration/index.js';

export { prettyTimeAgo, prettyTime } from './prettyTime/index.js';

export { default as convertSeconds } from './convertSeconds.js';
export { default as formatFutureDistance } from './formatFutureDistance.js';

export { default as monthsAgo } from './monthsAgo.js';

import formatMilliseconds from './formatMilliseconds.js';
export { formatMilliseconds };

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;
export const ONE_MONTH = 30 * ONE_DAY;
export const ONE_YEAR = 365 * ONE_DAY;

export function formatSeconds(seconds) {
  return formatMilliseconds(1000 * seconds);
}
