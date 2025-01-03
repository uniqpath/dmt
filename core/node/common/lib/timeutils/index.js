export { default as prettyMicroDuration } from './prettyMicroDuration/index.js';

export { prettyTimeAgo, prettyTime } from './prettyTime/index.js';

export { default as convertSeconds } from './convertSeconds.js';
export { default as formatFutureDistance } from './formatFutureDistance.js';

export { default as monthsAgo } from './monthsAgo.js';

import formatMilliseconds from './formatMilliseconds.js';
export { formatMilliseconds };

export function formatSeconds(seconds) {
  return formatMilliseconds(1000 * seconds);
}
