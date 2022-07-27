export { default as prettyMicroDuration } from './prettyMicroDuration/index.js';
export { default as prettyTimeAge } from './prettyTimeAge/index.js';
export { default as convertSeconds } from './convertSeconds.js';
export { default as formatFutureDistance } from './formatFutureDistance.js';

import formatMilliseconds from './formatMilliseconds.js';
export { formatMilliseconds };

export function formatSeconds(seconds) {
  return formatMilliseconds(1000 * seconds);
}
