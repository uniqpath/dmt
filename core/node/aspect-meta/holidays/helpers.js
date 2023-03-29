function getDataForCorrectYear(obj, year) {
  let match;
  let highestYear = 0;

  for (const o of obj) {
    if (year >= o.fromYear && o.fromYear > highestYear) {
      highestYear = o.fromYear;
      match = o;
    }
  }

  if (match) return { symbol: match.symbol, holidays: match.data };

  throw new Error(`Error: no data for ${year} ${JSON.stringify(obj)}`);
}

function easter(Y) {
  const C = Math.floor(Y / 100);
  const N = Y - 19 * Math.floor(Y / 19);
  const K = Math.floor((C - 17) / 25);
  let I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
  I -= 30 * Math.floor(I / 30);
  I -= Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
  let J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
  J -= 7 * Math.floor(J / 7);
  const L = I - J;
  const M = 3 + Math.floor((L + 40) / 44);
  const D = L + 28 - 31 * Math.floor(M / 4);

  return new Date(Y, M - 1, D);
}

function easterMonday(y) {
  const easterMonday = easter(y);
  easterMonday.setDate(easterMonday.getDate() + 1);
  return easterMonday;
}

function getCurrentYearMonthDay() {
  const currentTime = new Date();

  const month = currentTime.getMonth() + 1;

  const day = currentTime.getDate();

  const year = currentTime.getFullYear();

  return { year, month, day };
}

export { getDataForCorrectYear, easter, easterMonday, getCurrentYearMonthDay };
