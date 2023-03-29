function daysToMonths(days) {
  const monthsExact = days / 30;

  const wholeMonths = Math.floor(monthsExact);
  const decimalPart = monthsExact - wholeMonths;

  if (decimalPart < 0.25) {
    return wholeMonths;
  }

  if (decimalPart >= 0.75) {
    return wholeMonths + 1;
  }

  return wholeMonths + 0.5;
}

export default function monthsAgo(days) {
  if (days < 60 && ![29, 30, 31].includes(days)) {
    if (days % 7 == 0 || (days > 21 && [6, 0, 1].includes(days % 7))) {
      const weeks = Math.round(days / 7);
      return `${weeks} ${weeks == 1 ? 'week' : 'weeks'} ago`;
    }
    return `${days} days ago`;
  }

  const monthsExact = days / 30;

  const months = daysToMonths(days);

  if (monthsExact < 12) {
    return `${months} ${months == 1 ? 'month' : 'months'} ago`;
  }

  const roundMonths = Math.round(days / 30);

  const exactYears = days / 365;
  const years = Math.floor(exactYears);

  if (roundMonths % 12 == 0) {
    const _years = Math.round(exactYears);
    return `${_years} ${_years == 1 ? 'year' : 'years'} ago`;
  }

  const _days = days - years * 365;
  const _months = Math.round(_days / 30);

  if (_months == 6) {
    return `${years + 0.5} years ago`;
  }

  const __months = `${_months} ${_months == 1 ? 'month' : 'months'}`;

  return `${years} ${years == 1 ? 'year' : 'years'}${_months > 0 ? ` ${__months}` : ''} ago`;
}
