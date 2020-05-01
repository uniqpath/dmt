import dateFns from 'date-fns';

const { format, parse, formatDistance, formatDistanceToNow } = dateFns;

function prettyMacroTime(referenceDate) {
  return formatDistanceToNow(referenceDate, { addSuffix: true });
}

export default prettyMacroTime;
