import { dateFns } from '../../dmtHelper.js';

const { formatDistanceToNow } = dateFns;

export function prettyTimeAgo(referenceDate, { detailed = false } = {}) {
  const diff = Math.round((Date.now() - referenceDate) / 1000);

  if (detailed && diff < 60) {
    return `${diff}s ago`;
  }

  return formatDistanceToNow(referenceDate, { addSuffix: true })
    .replace('about ', '')
    .replace('less than a minute ', 'a few seconds ')
    .replace(/^1 day ago$/, 'yesterday')
    .trim();
}

export function prettyTime(ms) {
  return prettyTimeAgo(ms)
    .replace(' ago', '')
    .replace('yesterday', '1 day');
}
