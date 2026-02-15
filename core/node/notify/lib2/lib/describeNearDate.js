import { program } from 'dmt/common';

import localize from './localize.js';

export default function describeNearDate({ daysBefore, date, inDays }) {
  const { strTomorrow, arrDaysOfWeek, capitalizeFirstLetter } = localize(program);

  if (daysBefore == 1) {
    return strTomorrow;
  }

  if (daysBefore > 1 && daysBefore < 7) {
    return `${capitalizeFirstLetter(arrDaysOfWeek[date.getDay()])} [ ${inDays} ]`;
  }

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} [ ${inDays} ]`;
}
