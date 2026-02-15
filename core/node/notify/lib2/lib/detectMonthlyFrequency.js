export default function detectMonthlyFrequency(whenStr) {
  const regexMonthly = /^(\d+)x month(?:ly)?\b/i;
  const regexWeekly = /^(\d+)x week(?:ly)?\b/i;

  const matchesMonthly = whenStr.trim().match(regexMonthly);
  const matchesWeekly = whenStr.trim().match(regexWeekly);

  return { matchesWeekly, matchesMonthly };
}
