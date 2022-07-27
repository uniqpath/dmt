import { dateFns } from 'dmt/common';

const { isBefore, isAfter, isSameDay, differenceInCalendarDays } = dateFns;

import parseEUDate from './parseEUDate.js';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function parseFrom(date) {
  const i = MONTHS.indexOf(date.toLowerCase());
  if (i != -1) {
    const year = new Date().getFullYear();
    const date = new Date(year, i, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  return parseEUDate(date);
}

export function parseUntil(date) {
  const i = MONTHS.indexOf(date.toLowerCase());
  if (i != -1) {
    const year = new Date().getFullYear();
    const date = new Date(year, i + 1, 0);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  return parseEUDate(date);
}

export function evaluateTimespan({ date, from, until }) {
  const beforeEnd = until => {
    const untilDate = parseUntil(until);
    return isBefore(date, untilDate) || isSameDay(date, untilDate);
  };

  const afterStart = from => {
    const fromDate = parseFrom(from);
    return isAfter(date, fromDate) || isSameDay(date, fromDate);
  };

  const isValid = { isValid: true };

  if (until) {
    const untilDate = parseUntil(until);

    const isLastDay = isSameDay(date, untilDate);

    const diffDays = differenceInCalendarDays(untilDate, date);

    if (from) {
      if (isBefore(parseFrom(from), untilDate)) {
        if (afterStart(from) && beforeEnd(until)) {
          return { ...isValid, isLastDay, diffDays };
        }
      } else if (afterStart(from) || beforeEnd(until)) {
        return { ...isValid, isLastDay, diffDays };
      }
    } else if (beforeEnd(until)) {
      return { ...isValid, isLastDay, diffDays };
    }
  } else if (from) {
    if (afterStart(from)) {
      return isValid;
    }
  } else {
    return isValid;
  }

  return {};
}
