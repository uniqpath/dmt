import { dateFns } from 'dmt/common';

const { parse } = dateFns;

import dateTemplate from './dateTemplate.js';
import convertDateToEUFormat from './convertDateToEUFormat.js';

export default function parseEUDate(date) {
  const d = new Date();
  const euDate = convertDateToEUFormat(date, d.getFullYear());
  return parse(euDate, dateTemplate, d);
}
