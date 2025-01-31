import { dateFns } from 'dmt/common';

const { format } = dateFns;

export default function getDedupKey(dateTime) {
  const dt = new Date(dateTime.getTime());
  dt.setSeconds(0);
  return format(dt, 'yyyy-MM-dd H:mm');
}
