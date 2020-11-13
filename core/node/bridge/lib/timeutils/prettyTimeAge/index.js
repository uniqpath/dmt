import dmt from '../../dmtHelper';

const { formatDistanceToNow } = dmt.dateFns;

function prettyTimeAge(referenceDate, { detailed = false } = {}) {
  const diff = Math.round((Date.now() - referenceDate) / 1000);

  if (detailed && diff < 60) {
    return `${diff}s ago`;
  }

  return formatDistanceToNow(referenceDate, { addSuffix: true });
}

export default prettyTimeAge;
