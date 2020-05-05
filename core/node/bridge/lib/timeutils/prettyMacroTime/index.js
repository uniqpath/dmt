import dmt from '../../dmtHelper';

const { formatDistanceToNow } = dmt.dateFns;

function prettyMacroTime(referenceDate) {
  return formatDistanceToNow(referenceDate, { addSuffix: true });
}

export default prettyMacroTime;
