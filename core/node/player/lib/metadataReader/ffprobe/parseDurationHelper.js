export default function parseDuration(output) {
  let duration;

  const re = new RegExp(/Duration:\s([\d:]+)/i);

  const matches = output.match(re);

  if (matches) {
    duration = matches[1].replace(/^00:/, '');
  }

  return duration;
}
