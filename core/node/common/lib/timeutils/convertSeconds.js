import prettyTimeAge from './prettyTimeAge/index.js';

export default function convertSeconds(seconds) {
  return prettyTimeAge(Date.now() - seconds * 1000).replace(' ago', '');
}
