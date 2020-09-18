function pad(number, digits = 2) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function songTime(s) {
  s = Math.round(s);
  const hours = Math.floor(s / 3600);
  const rem = s % 3600;
  const min = Math.floor(rem / 60);
  s = rem % 60;

  return hours ? `${hours}h ${pad(min)}min ${pad(s)}s` : `${min}:${pad(s)}`;
}

export { songTime };
