import { dateFns } from '../../dmtHelper.js';

const { formatDistanceToNow } = dateFns;

export default function prettyTimeAge(referenceDate, { detailed = false } = {}) {
  const diff = Math.round((Date.now() - referenceDate) / 1000);

  if (detailed && diff < 60) {
    return `${diff}s ago`;
  }

  return formatDistanceToNow(referenceDate, { addSuffix: true });
}
