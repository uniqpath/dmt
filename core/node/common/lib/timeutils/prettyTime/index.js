import { dateFns } from '../../dmtHelper.js';

const { formatDistance } = dateFns;
export function prettyTimeAgo(referenceDate, { now = Date.now(), detailed = false, lang = undefined } = {}) {
  const diff = Math.round((now - referenceDate) / 1000);

  if (detailed && diff < 60) {
    return `${diff}s ago`;
  }

  const str = formatDistance(referenceDate, now, { addSuffix: true })
    .replace('about ', '')
    .replace('less than a minute ', 'a few seconds ')
    .replace(/^1 day ago$/, 'yesterday')
    .trim();

  return str;
}

export function prettyTime(ms, { now = Date.now() } = {}) {
  return prettyTimeAgo(ms, { now })
    .replace(' ago', '')
    .replace('yesterday', '1 day');
}
