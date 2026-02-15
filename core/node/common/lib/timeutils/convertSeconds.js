import { prettyTimeAgo } from './prettyTime/index.js';

export default function convertSeconds(seconds) {
  return prettyTimeAgo(Date.now() - seconds * 1000).replace(' ago', '');
}
