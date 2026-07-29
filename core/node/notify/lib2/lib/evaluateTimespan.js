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

const hasExplicitYear = dateStr => /\d{4}/.test(dateStr);

export function evaluateTimespan({ date, from, until }) {
  const beforeEnd = until => {
    const untilDate = parseUntil(until);
    return isBefore(date, untilDate) || isSameDay(date, untilDate);
  };

  const afterStart = from => {
    const fromDate = parseFrom(from);
    return isAfter(date, fromDate) || isSameDay(date, fromDate);
  };

  const isWithin = { isWithin: true };

  if (until) {
    const untilDate = parseUntil(until);
    const isLastDay = isSameDay(date, untilDate);

    if (from) {
      const fromDate = parseFrom(from);
      if (isBefore(fromDate, untilDate) || isSameDay(fromDate, untilDate)) {
        if (afterStart(from) && beforeEnd(until)) {
          const diffDays = differenceInCalendarDays(untilDate, date);
          return { ...isWithin, isLastDay, diffDays };
        }
      } else {
        if (hasExplicitYear(from) || hasExplicitYear(until)) {
          return {};
        }

        if (afterStart(from) || beforeEnd(until)) {
          let effectiveUntilDate = untilDate;
          if (isAfter(date, untilDate)) {
            effectiveUntilDate = new Date(untilDate);
            effectiveUntilDate.setFullYear(effectiveUntilDate.getFullYear() + 1);
          }
          const diffDays = differenceInCalendarDays(effectiveUntilDate, date);
          return { ...isWithin, isLastDay, diffDays };
        }
      }
    } else if (beforeEnd(until)) {
      const diffDays = differenceInCalendarDays(untilDate, date);
      return { ...isWithin, isLastDay, diffDays };
    }
  } else if (from) {
    if (afterStart(from)) {
      return isWithin;
    }
  } else {
    return isWithin;
  }

  return {};
}
