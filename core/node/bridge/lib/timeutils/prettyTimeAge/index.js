import dmt from '../../dmtHelper';

const { formatDistanceToNow } = dmt.dateFns;

function prettyTimeAge(referenceDate) {
  const diff = Math.round((Date.now() - referenceDate) / 1000);

  if (diff < 60) {
    return `${diff}s ago`;
  }

  return formatDistanceToNow(referenceDate, { addSuffix: true });
}

export default prettyTimeAge;
